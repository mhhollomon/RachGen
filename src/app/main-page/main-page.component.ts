import { AfterViewInit, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, filter, map, take } from 'rxjs';
import { List } from 'immutable';

import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { ScaleService } from '../scale.service';
import { RandomChordService, RandomChordError, defaultModeList } from '../random-chord.service';
import { Chord, NamedNoteList, voiceChord } from '../utils/music-theory/chord';
import { Scale, ScaleType } from '../utils/music-theory/scale';
import { Note } from '../utils/music-theory/note';
import { AudioService } from '../audio.service';
import { MidiDialogComponent, MidiConfig, defaultMidiConfig } from '../midi-dialog/midi-dialog.component';
import { PreferencesService } from '../services/preferences.service';
import { ChordEditDialogComponent } from '../chord-edit-dialog/chord-edit-dialog.component';
import { GeneratorOptions, defaultGeneratorOptions } from '../generator-options/generator-options.component';
import { NewListDialogComponent } from '../new-list-dialog/new-list-dialog.component';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';
import { CustomChord } from '../utils/custom-chord';
import { defaultScaleChangeConfig, ScaleChangeDialogComponent } from '../scale-change-dialog/scale-change-dialog.component';
import { MainPageStore } from '../store/main-page-store';
import { Midi } from '../utils/midi';


interface genListReturn {
  nl : NamedNoteList[];
  scale : Scale;
}

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent implements OnInit, AfterViewInit {

  generateOptions : GeneratorOptions = defaultGeneratorOptions();

  default_scale$ = this.mainPageStore.default_scale$;
  chord_list$ = this.mainPageStore.chord_list$;

  chords_exist$ = this.mainPageStore.chord_list$.pipe(map(cl => cl.length > 0 ))
  any_chords_locked$ = this.mainPageStore.chord_list$.pipe(map(cl => cl.filter(c => c.keep ).length > 0  ));
  all_chords_locked$ = this.mainPageStore.chord_list$.pipe(map(cl => cl.filter(c => !c.keep ).length == 0  ));
  scale_notes$ = this.default_scale$.pipe(map(ds => (ds == null ? List<Note>([]) : ds.notesOfScale() )));

  current_chords$ = new BehaviorSubject<NamedNoteList[]>([]);

  default_scale : Scale | null = null;
  any_chords_locked = false;
  chord_count = 0;

  get scale_notes() : List<Note> {
    if (this.default_scale != null) {
      return this.default_scale.notesOfScale();
    } else {
      return List<Note>([]);
    }
  }

  private get chord_list() {
    return this.current_chords$.getValue();
  }

  all_play_active = false;

  midi_config : MidiConfig = defaultMidiConfig();

  generatorOptionsExpanded = false;

  @ViewChild('expansion') private _expansion_panel! :MatExpansionPanel;
  

  constructor(private scaleService : ScaleService,
    private randomChordService : RandomChordService,
    private audioService : AudioService,
    public dialog: MatDialog, 
    @Inject(DOCUMENT) private document : Document,
    private preferences : PreferencesService,
    public mainPageStore : MainPageStore,

    ) {

      console.log("main-page contructor");

      // Do this in the constructor to make sure it is set before the view initializes.
      this.generatorOptionsExpanded = this.preferences.read('gen_opts_panel', false);
      this.generateOptions = this.preferences.read('gen_opts_data', this.generateOptions);

  }

  ngOnInit(): void {

    console.log("main-page ngOnInit called")

    const midi_pref = this.preferences.read('midi', this.midi_config);

    if (! ('fileName' in midi_pref)) {
      midi_pref['fileName'] = defaultMidiConfig().fileName; 
    }

    this.midi_config = midi_pref as MidiConfig;


    // Snag any changes to the midi preferences.
    this.preferences.prefChange.pipe(filter((k)=> k === 'midi')).subscribe(() => {
      Object.assign(this.midi_config, this.preferences.read('midi', this.midi_config));
    });

    // Listen for changes in the default_scale
    this.default_scale$.subscribe((newScale) => {
          this.default_scale = newScale;
    });

    this.any_chords_locked$.subscribe((v) => { this.any_chords_locked = v; })

    this.chord_list$.subscribe(this.current_chords$);
    this.chord_list$.pipe(map(cl => cl.length)).subscribe(num => { this.chord_count = num; });

  }

  ngAfterViewInit(): void {
    console.log("random-chord afterViewInit called")
    this._expansion_panel.close();
  }

  get chord_count_max() : number {
    if (this.generateOptions.duplicates !== 'none') {
      return 30;
    }

    let types = 0;
    if (this.generateOptions.chordTypes['triad'].flag) types += 1;
    if (this.generateOptions.chordTypes['sus2'].flag) types += 1;
    if (this.generateOptions.chordTypes['sus4'].flag) types += 1;

    if (types > 1) {
      return 10;
    }
    
    return 6;
  }

  get panelTitle() : string {
    return (this.default_scale ? this.default_scale.nameUnicode() :  "No Scale");
  }

  default_scale_exists() { return this.default_scale != null && this.default_scale instanceof Scale; }

  gen_opts() : GeneratorOptions {
    return Object.assign({}, this.generateOptions);
  }

  get_scale_name(c : NamedNoteList) : string {
    return (c instanceof Chord) ? c.scale.nameUnicode() : 'unknown-scale';
  }

  /************* EVENT HANDLERS   *************************/

  show_chord_scale_info(chord : NamedNoteList) {

    if (! (chord instanceof Chord)) return;

    this.dialog.open(ScaleChangeDialogComponent, { data : {allow_change : false, scale : chord.scale}});

  }

  default_scale_click(event : Event) {
    this.stopPropagation(event);

    if (! this.default_scale_exists()) {
      this.change_default_scale();
    } else {
      this._expansion_panel.toggle();
    }
  }

  change_default_scale() {
    const dia_data = defaultScaleChangeConfig();
    dia_data.scale = (this.default_scale || new Scale() );
    const dia = this.dialog.open(ScaleChangeDialogComponent, { data : dia_data} );

    dia.afterClosed().pipe(filter((s) => !!s)).subscribe((s) => {
        this.mainPageStore.change_scale(s);
    });
  }

  generate_options_change(event : GeneratorOptions) {
    this.generateOptions = Object.assign({}, event);
  }

  generatorOptionsPanelChange(v : boolean) {
    this.generatorOptionsExpanded = v;
    this.preferences.write('gen_opts_panel', v);
  }

  stopPropagation(evnt : Event) {
    evnt.stopPropagation();
  }
  
  chord_drop(evnt : CdkDragDrop<string[]>) {
    this.mainPageStore.move_chord({ before : evnt.previousIndex, after : evnt.currentIndex});
  }

  edit_chord_modal(chord_index : number, chord : NamedNoteList, operation : string) {

    const adding_chord = (operation === 'insert');


    const dia = this.dialog.open(ChordEditDialogComponent, { data : chord });
    
    dia.afterClosed().subscribe((newChord) => {
      if (newChord) {
        if (adding_chord) {
          this.mainPageStore.insert_chord({ chord : newChord, index : chord_index});
        } else {
          this.mainPageStore.replace_chord({ chord : newChord, index : chord_index});
        }
      }

    })
  }

  delete_chord(chord_index : number) {
    this.mainPageStore.delete_chord(chord_index);
  }

  chordIsCustom(chord : NamedNoteList) : boolean {
    return (chord instanceof CustomChord);
  }

  add_chord(pos : 'before' | 'after', index : number) {


    if (! this.default_scale ) return; 

    const newChord = new Chord(this.default_scale, 1);

    if (pos === 'after') index += 1;

    this.edit_chord_modal(index, newChord, 'insert');
  }


  generate_new_chord(chord : NamedNoteList, chord_index : number) {
    const builder = this.randomChordService.builder();

    let scale : Scale;

    if (this.chordIsCustom(chord) && this.default_scale) {
      scale = this.default_scale;
    } else if (chord instanceof Chord ) {
      scale = chord.scale;
    } else {
      throw Error("Could not calculate a scale");
    }


    // override count to just do one.
    builder.setOptions(this.generateOptions)
      .setCount({min : 1, max : 1})
      .setKey(scale);

    const newChords = builder.generate_chords();
    this.mainPageStore.replace_chord({ chord : newChords[0],  index : chord_index})

  }

  set_default_scale(chord : NamedNoteList) {
    if (! (chord instanceof Chord)) return;

    this.mainPageStore.change_scale(chord.scale);
  }

  set_to_default_scale(chord : NamedNoteList, chord_index : number) {
    if (! this.default_scale) return;
    if (! (chord instanceof Chord)) return;

    if (! this.default_scale.isSame(chord.scale)) {
      this.mainPageStore.replace_chord( { chord : chord.change_scale(this.default_scale), index : chord_index});
    }


  }


  async gen_list(fn? : (data : genListReturn) => void ) {
    const dia = this.dialog.open(NewListDialogComponent, { data : Object.assign({}, this.generateOptions) });

    dia.afterClosed().pipe(filter((o) => !!o)).subscribe((opts) => {
      this.all_play_active = false;
      this.generate_options_change(opts);
      const retval = this.generate(this.generateOptions);
      this.mainPageStore.change_scale(retval.scale);
      if (fn) fn(retval);
    });
  }

  start_new_list(chords_exist : boolean) {
    if (chords_exist) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, 
          { data: "This Will Remove All Existing Chords"});

      dia.afterClosed().subscribe((confirm) => {
        if (confirm) {
          this.generateOptions.key_source = 'Random';
          this.gen_list((genret) => {
            this.mainPageStore.replace_chord_list(genret.nl);
            this.mainPageStore.change_scale(genret.scale);
          });
        }
      });
    } else {
      // this can't go in gen_list since that is also shared by append_to_list
      this.generateOptions.key_source = 'Random';
      this.gen_list((genret) => {
        this.mainPageStore.replace_chord_list(genret.nl);
        this.mainPageStore.change_scale(genret.scale);
      });
    }
  }

  append_to_list() {
    this.generateOptions.key_source = 'Selected';
    if (this.default_scale) {
      this.generateOptions.center = this.default_scale.center;
      this.generateOptions.tonality = this.default_scale.type;
    }
    this.gen_list((genret) => {
      this.mainPageStore.append_chords(genret.nl);
    });
  }

  /********   CHORD LOCKING ***************/

  lock_chord(chord : NamedNoteList, index : number) : void {
      chord.keep = ! chord.keep;
      this.mainPageStore.replace_chord({ chord : chord , index : index});
  }

  unlock_all_chords() {
    this.mainPageStore.unlock_all_chords();
  }
   

  delete_unlocked_chords() {


    if (! this.any_chords_locked ) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, { data : 'This will delete all chords since none are locked'});
      dia.afterClosed().subscribe((yes) => {
        if (yes) this.mainPageStore.delete_unlocked_chords();
      });

    } else {
      this.mainPageStore.delete_unlocked_chords();
    }
  }

  replace_unlocked_chords() {
    if (! this.any_chords_locked) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, { data : 'This will replace all chords since none are locked'});
      dia.afterClosed().subscribe((yes) => {
        if (yes) {
          this.all_play_active = false;
          const opts = Object.assign({}, this.generateOptions);
          if (this.default_scale) {
            opts.key_source = 'Selected';
            opts.center = this.default_scale.center;
            opts.tonality = this.default_scale.type;
          }
          const retval = this.generate(opts);
          this.mainPageStore.replace_chord_list(retval.nl);
        }
      });

    } else {
      this.all_play_active = false;
      this.run_generator_with_nl(this.generateOptions, undefined, retval => 
        { this.mainPageStore.replace_chord_list(retval.nl); })
}
  }

  // ------- RUN THE GENERATOR -------------------------------------

  run_generator_with_nl(opts: GeneratorOptions, 
      prefn? : (cl : NamedNoteList[]) => void, 
      postfn?  : (glr : genListReturn) => void) {

    this.chord_list$.pipe(take(1)).subscribe(cl => {
      prefn ? prefn(cl) : '';
      const retval = this.generate(this.generateOptions, cl);
      postfn ? postfn(retval) : '';
    })


  }
  // ------- GENERATE A RANDOM LIST -------------------------------------

  generate(opts: GeneratorOptions,  start_set? : NamedNoteList[]) : genListReturn {

    if (opts.count_range_mode) {
      if (opts.count.min > this.chord_count_max || opts.count.min < 1) {
        throw Error("icky");
      }

      if (opts.count.min > opts.count.max) {
        this.dialog.open(ErrorDialogComponent, {
          data: "min count must be less than or equal to max chord count",
        });
        throw Error("icky");
      }
    } else {
      if (opts.count.min > this.chord_count_max || opts.count.min < 1) {
        throw Error("icky");
      }

      opts.count.max = opts.count.min

    }

    this.preferences.write('gen_opts_data', opts);

    let scale : Scale;
    if (opts.key_source === "Selected") {
      if (opts.center === 'Random') {
        scale = this.scaleService.choose(opts.tonality as ScaleType);
      } else {
       scale = new Scale({ 
              center : opts.center, 
              type : opts.tonality as ScaleType});
      }
    } else {
      scale = this.scaleService.choose();
    }


    try {
      const builder = this.randomChordService.builder();

      builder.setOptions(opts).setKey(scale);

      // for now
      if (opts.modes_on) {
        builder.setModes(defaultModeList.push('phrygian'), 10);
      }

      let nl : NamedNoteList[];

      if (start_set) {
        nl = builder.generate_chords(start_set);
      } else {
        nl = builder.generate_chords();
      }

      return { nl : nl, scale : scale };

    } catch(e) {
      let error_msg = 'oopsy - unknown error';
      if (typeof e === "string") {
        error_msg = e;
      } else if (e instanceof RandomChordError) {
        error_msg = e.message;
      } else if (e instanceof Error) {
          error_msg = e.message;
          if (e.stack) {
            error_msg += "\n" + e.stack;
          }
      }

      this.dialog.open(ErrorDialogComponent, {
        data: error_msg,
      });

      throw e;
    }

  }

  /************** AUDIO  **************/

  async play_chord(chord : NamedNoteList, seconds? : number) {

    const tones = voiceChord(chord);
  
    await this.audioService.play_chord(tones, seconds);

    return '';

  }

  async play_all_chords() {

    this.all_play_active = ! this.all_play_active;

    if (this.all_play_active) {
      setTimeout(() => { this.highlight_next_chord(-99, 0)});
    }
  }

  // These work as a team, switching off between each other to highlight,play,highlight, etc

  async highlight_next_chord(last : number, next : number) {

    const playClassName = 'playing';


    if (last >=0 ) {
      const ellist = this.document.querySelectorAll(`.chord-index-${last}`);

      ellist.forEach((el) => {
        (el as HTMLElement).classList.remove(playClassName);
      });
    }

    // If asked to stop, simply stop.
    if (!this.all_play_active) return;

    if (next >=0 && next < this.chord_count) {
      const ellist = this.document.querySelectorAll(`.chord-index-${next}`);

      ellist.forEach((el) => {
        (el as HTMLElement).classList.add(playClassName);
      });
      setTimeout(() => { this.play_next_chord(last, next)}, 10)        
    } else {
      this.all_play_active = false;
    }
    
  }

  async  play_next_chord(last : number, next : number) {

    const beepLength = 0.5;

    if (next >= 0 && next < this.chord_count) {

      this.play_chord(this.current_chords$.getValue()[next], beepLength);
      last = next;
      next += 1;

      // Note, we don't check all_play_active because we would still need to unhighlight
      setTimeout(() => { this.highlight_next_chord(last, next)}, 1000 * 2 * beepLength)
    }
  }


/******************************* MIDI  *******************************************/

  private midi_state = 'off';

  get midi_disabled():boolean {
    return this.chord_count < 1;
  }

  wait_for_midi(source : string, event : Event) {
    this.stopPropagation(event);

    console.log(`source = ${source}, midi_state = ${this.midi_state}`, event);
 
    if (this.midi_state === 'off' ) {
      if (source === 'click') {
        this.midi_state = 'debounce';
        // wait 20 ms to see if the Long press arrives. If it does,
        // do nothing, it will handle the dialog.
        // We will know if it arrives becasue the event will set the midi_state
        // to 'generating' rather than 'debounce'.
        setTimeout(() => {
          if (this.midi_state === 'debounce') {
            this.midi_state = 'generating';

            this.chord_list$.pipe(take(1)).subscribe(cl => {
              (new Midi(this.midi_config))
                  .generate(cl, this.default_scale ? this.default_scale : undefined );
              this.midi_state = 'off';
            })

          }
        }, 20);
      } else if (source === 'lp') {
        this.midi_state = 'generating';
        this.show_midi_dialog();
      }
    } else if (this.midi_state == 'debounce') {
      if (source === 'lp') {
        this.midi_state = 'generating';
        this.show_midi_dialog();
      }
    }
  }
  
  show_midi_dialog() {
    console.log("Showing midi dialog");

    const dialogRef = this.dialog.open(MidiDialogComponent, {data : Object.assign({}, this.midi_config)});

    dialogRef.afterClosed().subscribe(result => {
      console.log(`dialog = ${result}`);

      if (result) {
        this.chord_list$.pipe(take(1)).subscribe(cl => {
          (new Midi(result))
              .generate(cl, this.default_scale ? this.default_scale : undefined );
        })
      }
      this.midi_state = 'off';
    });

  }


}
