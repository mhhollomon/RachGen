import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { filter } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatExpansionPanel } from '@angular/material/expansion';
import {CdkDragDrop} from '@angular/cdk/drag-drop';

import { saveAs } from 'file-saver';
import  * as Midiwriter  from 'midi-writer-js';
import * as dayjs from 'dayjs';

import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import {ScaleService } from '../scale.service';
import { RandomChordService, RandomChordError } from '../random-chord.service';
import { Chord } from '../utils/music-theory/chord';
import { CMajorID, defaultScaleID, Scale, ScaleType } from '../utils/music-theory/scale';
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
import { ChordListCacheService } from '../services/chord-list-cache.service';


const octavePlacement : { [ index : string ] : number } = {
  'C' : 0, 'D' : 1, 'E' : 2, 'F' : 3, 'G' : 4, 'A' : 5, 'B' : 6 
}


@Component({
  selector: 'app-random-chords',
  templateUrl: './random-chords.component.html',
  styleUrls: ['./random-chords.component.scss']
})
export class RandomChordsComponent implements OnInit, AfterViewInit, OnDestroy {

  generateOptions : GeneratorOptions = defaultGeneratorOptions();

  scale_notes : Note[] = [];

  all_play_active = false;

  midi_config : MidiConfig = defaultMidiConfig();

  generatorOptionsExpanded = false;

  @ViewChild('expansion') private _expansion_panel! :MatExpansionPanel;
  
  default_scale : Scale | null = null;


  constructor(private scaleService : ScaleService,
    private randomChordService : RandomChordService,
    private audioService : AudioService,
    public dialog: MatDialog, 
    @Inject(DOCUMENT) private document : Document,
    private preferences : PreferencesService,
    public store : ChordListCacheService

    ) {

      console.log("Calling random-chord contructor");

      // Do this in the constructor to make sure it is set before the view initializes.
      this.generatorOptionsExpanded = this.preferences.read('gen_opts_panel', false);
      this.generateOptions = this.preferences.read('gen_opts_data', this.generateOptions);

  }

  ngOnInit(): void {

    console.log("random-chord ngOnInit called")

    if (this.default_scale) {
      this.scale_notes = this.default_scale.notesOfScale();
    }
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

    this.store.scale.subscribe((newScaleID) => {
        if (newScaleID) {
          this.default_scale = new Scale(newScaleID);
          this.scale_notes = this.default_scale.notesOfScale();
          this.generateOptions.scale = this.default_scale.scaleID();

        } else {
          this.default_scale = null;
          this.scale_notes = [];
          this.generateOptions.scale = defaultScaleID();
        }     
    });
  }

  ngAfterViewInit(): void {
    console.log("random-chord afterViewInit called")
    this._expansion_panel.close();
  }

  ngOnDestroy() : void {
    console.log("random-chord onDestroy called")
  }

  get chords() { return this.store.chord_array(); }

  get chords_exist() { return this.store.chord_count() > 0; }

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
    return (this.default_scale ? this.default_scale.fullDisplay() :  "No Scale");
  }

  default_scale_exists() { return this.default_scale != null && this.default_scale instanceof Scale; }

  gen_opts() : GeneratorOptions {
    return Object.assign({}, this.generateOptions);
  }

  /************* EVENT HANDLERS   *************************/

  show_chord_scale_info(chord_index : number) {
    const dia_data = defaultScaleChangeConfig();
    dia_data.allow_change = false;

    this.dialog.open(ScaleChangeDialogComponent, { data : dia_data});

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
    dia_data.scaleID = (this.default_scale?.scaleID() || CMajorID() );
    const dia = this.dialog.open(ScaleChangeDialogComponent, { data : dia_data} );

    dia.afterClosed().subscribe((s) => {
      if (s) {
        this.store.change_scale(s);
      }
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
    this.store.move_chord(evnt.previousIndex, evnt.currentIndex);
  }

  edit_chord_modal(chord_index : number, chord? : Chord) {

    // if chord is defined then we are being asked to edit then add.
    // if it is NOT defined, we are being asked to edit the existing chord.

    let adding_chord = false;

    if (chord == undefined) {
      chord = this.store.get_a_chord(chord_index);
    } else {
      adding_chord = true;
    }

    if (!chord) return;

    const dia = this.dialog.open(ChordEditDialogComponent, { data : chord });
    
    dia.afterClosed().subscribe((newChord) => {
      if (newChord) {
        if (adding_chord) {
          this.store.add_chord(newChord.clone(), chord_index);
        } else {
          this.store.replace_chord(newChord.clone(), chord_index);
        }
      }

    })
  }

  delete_chord(chord_index : number) {
    this.store.delete_chord(chord_index);
  }

  chordIsCustom(chord : Chord | number) : boolean {
    let test_chord : Chord | undefined = undefined;
    if (typeof chord === 'number')
      test_chord = this.store.get_a_chord(chord);
    else {
      test_chord = chord;
    }

    return (chord instanceof CustomChord);
  }

  add_chord(pos : 'before' | 'after', index : number) {
    const newChord = new Chord();


    if (! this.default_scale ) return; 

    newChord.setScale(this.default_scale)
        .setRootFromDegree(1);

    if (pos === 'after') index += 1;

    this.edit_chord_modal(index, newChord);
  }


  generate_new_chord(chord_index : number) {
    const builder = this.randomChordService.builder();

    let scale : Scale | undefined = this.store.get_a_chord(chord_index)?.scale;

    if (this.chordIsCustom(chord_index) && this.default_scale) {
      scale = this.default_scale;
    }

    if (! scale) {
      throw Error("Could not figure out a scale");
    }

    // override count to just do one.
    builder.setOptions(this.generateOptions)
      .setCount({min : 1, max : 1})
      .setKey(scale);

    const newChords = builder.generate_chords();
    this.store.add_chord(newChords[0], chord_index)

  }

  set_default_scale(chord_index : number) {

    const chord_scale = this.store.get_a_chord(chord_index)?.scale;
    this.store.change_scale(chord_scale ? chord_scale : null);
  }

  set_to_default_scale(chord_index : number) {
    if (! this.default_scale) return;

    const chord = this.store.get_a_chord(chord_index);
    if (!chord) return;

    if (! this.default_scale.isSame(chord.scale)) {
      chord.change_scale(this.default_scale);
      this.store.replace_chord(chord.clone(), chord_index);
    }


  }

  async gen_list(fn? : (data : Chord[]) => void ) {
    const dia = this.dialog.open(NewListDialogComponent, { data : Object.assign({}, this.generateOptions) });

    dia.afterClosed().subscribe((opts) => {
      this.generate_options_change(opts);
      const chords = this.generate();
      const s = new Scale (this.generateOptions.scale);
      this.store.change_scale(s);
      if (fn) fn(chords);
    });
  }

  start_new_list() {
    if (this.chords_exist) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, 
          { data: "Removing All Existing Chords"});

      dia.afterClosed().subscribe((confirm) => {
        if (confirm) {
          this.generateOptions.key_source = 'Random';
          this.gen_list((chords) => {
            this.store.replace_chord_list(chords);
          });
        }
      });
    } else {
      // this can't go in gen_list since that is also shared by append_to_list
      this.generateOptions.key_source = 'Random';
      this.gen_list((chords) => {
        this.store.replace_chord_list(chords);
      });
    }
  }

  append_to_list() {
    this.generateOptions.key_source = 'Selected';
    this.generateOptions.center = this.generateOptions.scale.key_center;
    this.generateOptions.tonality = this.generateOptions.scale.type;
    this.gen_list((chords) => {
      this.store.append_chords(chords);
    });
  }

  /********   CHORD LOCKING ***************/

  lock_chord(index : number) : void {
    if (this.store.chord_count() > index) {
      const c = this.store.get_a_chord(index);
      if (c) {
        c.keep = ! c.keep;
        this.store.replace_chord(c.clone(), index);
      }
    }
  }

  chord_locked(index : number) : boolean {
    if (this.store.chord_count() > index) {
      const c = this.store.get_a_chord(index);
      return c != undefined && c.keep;
    }

    return false;
  }

  unlock_all_chords() {
    for (const c of this.store.chord_list()) {
      c.keep = false;
    }
  }

  any_chords_locked() : boolean {
    for (const c of this.store.chord_list()) {
      if (c.keep) return true;
    }
    return false;
  }

  all_chords_locked() : boolean {
    for (const c of this.store.chord_list()) {
      if (! c.keep) return false;
    }
    return true;
  }
   

  delete_unlocked_chords(do_it? : boolean ) {

    if (do_it) {
      const chords = this.store.chord_list().filter((k) => k.keep);
      this.store.replace_chord_list(chords);
      return;
    }

    if (! this.any_chords_locked() ) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, { data : 'This will delete all chords since none are locked'});
      dia.afterClosed().subscribe((yes) => {
        if (yes) this.delete_unlocked_chords(true);
      });

    } else {
      this.delete_unlocked_chords(true);
    }
  }

  replace_unlocked_chords() {
    if (! this.any_chords_locked()) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, { data : 'This will replace all chords since none are locked'});
      dia.afterClosed().subscribe((yes) => {
        if (yes) {
           const c = this.generate(true);
           this.store.replace_chord_list(c);
        }
      });

    } else {
      const c = this.generate();
      this.store.replace_chord_list(c);
    }
  }

  generate(use_start_set? : boolean) : Chord[] {

    this.all_play_active = false;

    if (this.generateOptions.count_range_mode) {
      if (this.generateOptions.count.min > this.chord_count_max || this.generateOptions.count.min < 1) {
        throw Error("icky");
      }

      if (this.generateOptions.count.min > this.generateOptions.count.max) {
        this.dialog.open(ErrorDialogComponent, {
          data: "min count must be less than or equal to max chord count",
        });
        throw Error("icky");
      }
    } else {
      if (this.generateOptions.count.min > this.chord_count_max || this.generateOptions.count.min < 1) {
        throw Error("icky");
      }

      this.generateOptions.count.max = this.generateOptions.count.min

    }

    this.preferences.write('gen_opts_data', this.generateOptions);

    let picked_key : Scale | null = null;

    if (this.generateOptions.key_source === "Selected") {
      if (this.generateOptions.center === 'Random') {
        this.generateOptions.scale = this.scaleService.choose(this.generateOptions.tonality as ScaleType).scaleID();
      } else {
        this.generateOptions.scale = { key_center : this.generateOptions.center, type : this.generateOptions.tonality as ScaleType};
      }
    } else {
      this.generateOptions.scale = this.scaleService.choose().scaleID();
    }
    picked_key = new Scale(this.generateOptions.scale);


    try {
      const builder = this.randomChordService.builder();

      builder.setOptions(this.generateOptions);

      if (use_start_set == undefined) {
        use_start_set = this.any_chords_locked();
      }

      if (use_start_set) {
        return builder.generate_chords(this.store.chord_array());
      } else {
        return builder.generate_chords();
      }

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

  async play_chord(chord : Chord, seconds? : number) {

    const tones = chord.voiceChord();
  
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

    if (next >=0 && next < this.store.chord_count()) {
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

    if (next >= 0 && next < this.store.chord_count()) {

      this.play_chord(this.store.chord_array()[next], beepLength);
      last = next;
      next += 1;

      // Note, we don't check all_play_active because we would still need to unhighlight
      setTimeout(() => { this.highlight_next_chord(last, next)}, 1000 * 2 * beepLength)
    }
  }


/******************************* MIDI  *******************************************/

  private midi_state = 'off';

  get midi_disabled():boolean {
    return this.store.chord_count() < 1;
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
            this.generate_midi(this.midi_config);
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
        this.generate_midi(result);
      } else {
        this.midi_state = 'off';
      }
    });

  }

  generate_midi(config : MidiConfig) {
    console.log("generating midi data");

    if (this.store.chord_count() < 1) return;

    const mainTrack = new Midiwriter.Track();
    let bassTrack;
    if (config.separateBass) {
      bassTrack = new Midiwriter.Track();
    }

    let trackName = '';

    for (const c of this.store.chord_array()) {
      trackName += c.name() + ' ';
    }

    if (config.includeScale) {
      trackName += this.default_scale?.fullName();
    }

    mainTrack.addTrackName(trackName);
    if (bassTrack) {
      bassTrack.addTrackName(trackName);
    }

    for (const c of this.store.chord_array()) {

      let isBassNote = true;
  
      const mainOptions : Midiwriter.Options = {sequential: false, duration : '1', pitch : []}
      const bassOptions : Midiwriter.Options = {sequential: false, duration : '1', pitch : []}

      for (const n of c.voiceChord()) {

        if (isBassNote) {
          if (bassTrack) {
            (bassOptions.pitch as unknown as string[]).push(n);
          } else {
            (mainOptions.pitch as unknown as string[]).push(n);
          }
          isBassNote = false;
        } else {
          (mainOptions.pitch as unknown as string[]).push(n);
        }  
      }

      if (config.includeMarkers) {
        mainTrack.addMarker(c.name());
      }
      mainTrack.addEvent(new Midiwriter.NoteEvent(mainOptions))
      if (bassTrack) {
        bassTrack.addEvent(new Midiwriter.NoteEvent(bassOptions))
      }
    }

    if (config.includeScale) {
      if (config.includeMarkers) {
        mainTrack.addMarker(this.default_scale?.fullName() + " Scale")
      }

      let octave = ['G', 'A', 'B'].includes(this.scale_notes[0].toSharp().noteClass) ? 3 : 4;
      let last  = -1;
      let scale_options : Midiwriter.Options = {sequential: true, duration : '4', pitch : []}
      for (const n of this.scale_notes) {

        const simpleNote = n.toSharp();


        if (octavePlacement[simpleNote.noteClass] < last) {
          // write what we have and start a new sequence
          mainTrack.addEvent(new Midiwriter.NoteEvent(scale_options))
          scale_options = {sequential: true, duration : '4', pitch : []}
          octave += 1;
        }
        (scale_options.pitch as unknown as string[]).push(simpleNote.note() + octave );
        last = octavePlacement[simpleNote.noteClass];
      }

      mainTrack.addEvent(new Midiwriter.NoteEvent(scale_options))

    }

    const tracks = [ mainTrack];
    if (bassTrack) {
      tracks.push(bassTrack);
    }

    const midi_writer = new Midiwriter.Writer(tracks);

    const filename = this.interpolate_midi_filename(config.fileName) + ".mid";

    const  blob = new Blob([midi_writer.buildFile()], {type: "audio/midi"});
    saveAs(blob, filename);

    this.midi_state = 'off';

  }

  interpolate_midi_filename(input_string : string) : string {
    const re = /(?<varname>\${\w+})/g;

    const date = dayjs();


    const value_map : any = {
      'date' : date.format('YYYYMMDD'),
      'time' : date.format('HHmmss'),
      'scale' : this.default_scale?.fullName() || 'unknown',
      'count' : this.store.chord_count(),
    }


    return input_string.replaceAll(re, (s) => {
      const varname = s.substring(2, s.length-1);
      if (varname in value_map) {
        return value_map[varname];
      } else {
        return '???';
      }
    });
  }


}
