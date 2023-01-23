import { Component, Inject, OnInit } from '@angular/core';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

import { saveAs } from 'file-saver';
import  * as Midiwriter  from 'midi-writer-js';
import * as dayjs from 'dayjs';

import { HelpTextEmitterService } from '../services/help-text-emitter.service';
import {ScaleService } from '../scale.service';
import { RandomChordService, RandomChordError } from '../random-chord.service';
import { Chord } from '../utils/music-theory/chord';
import { CMajorID, Scale, ScaleType } from '../utils/music-theory/scale';
import { Note } from '../utils/music-theory/note';
import { AudioService } from '../audio.service';
import { DOCUMENT } from '@angular/common';
import { MidiDialogComponent, MidiConfig, defaultMidiConfig } from '../midi-dialog/midi-dialog.component';
import { PreferencesService } from '../services/preferences.service';
import { filter } from 'rxjs';
import { ChordEditDialogComponent } from '../chord-edit-dialog/chord-edit-dialog.component';
import { GeneratorOptions, defaultGeneratorOptions } from '../generator-options/generator-options.component';
import { NewListDialogComponent } from '../new-list-dialog/new-list-dialog.component';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';
import { CustomChord } from '../utils/custom-chord';
import { ScaleChangeDialogComponent } from '../scale-change-dialog/scale-change-dialog.component';


const HELP_TEXT = `
<p>This page will let you generate a series of random chords</p>
<table>
<tr class="bg-light-gray mhh-mat-label"><td class="b">Mode</td></tr>
<tr><td>
    The mode sets how the generated chords are releated to each other and a  specified scale
    <ul>
      <li><span class="b">Diatonic</span> - (default) The chords generate will be "in" a key. The root note for
          each chord will be taken from the given scale. The quality will be set according to the scale.
          In particular that means that there can be at most 7 unique chords.
          <p>The key itself may be random or selected by the user (see below). <p>
      </li>
      <li><span class="b">Chromatic</span> - The chords are not related to each other. The root note
          of each chord is selected at random from the keyboard. A quality (major, minor, augmented, diminished)
          is choosen separately.
    </ul>
</td></tr>

<tr class="bg-light-gray mhh-mat-label"><td class="b">Duplicates</td></tr>
<tr>
  <td>What duplicates are allowed. A chord is considered a "duplicate" if it has the same root note and the same
      chord type (triad, sus2, sus4). extensions and inversion are not considered. 
      <ul>
        <li><span class="b">None</span> - (default) No duplicates are allowed.</li>
        <li><span class="b">Not Adjacent</span> - Duplicates are allowed as long as they are not next to each other in the set of chords</li>
        <li><span class="b">Any</span> - All duplicates are allowed</li>
      </ul>
      
  </td>
</tr>

<tr class="bg-light-gray mhh-mat-label"><td class="b">Chord Count</td></tr>
<tr><td>
  How many chords to generate.
  <p>By default the interface allows you to pick a particular number of chords
    to generate. The maximum allowed depends on the configuration. </p>

    <ul>
      <li> IF Duplicates = 'None' 
        <ul>
          <li> IF more than one of triads, sus2, sus4 are chosen, then : 1-10</li>
          <li> ELSE 1-6</li>
        </ul>
      </li>
      <li>ELSE 1-30</li>
    </ul>

  <p> The expander to the right allows you to open the interface so that you can choose a range 
    of numbers. The actual number of chords returned will be in that range - inclusive.</p>
</td></tr>


<tr class="bg-light-gray  mhh-mat-label"><td class="b">Selection Actions</td></tr>
<tr>
  <td>
      Shortcut actions for chord constraints.
      <p>Note that thes buttons only change things that are below them - so, Chord Types, Extensions, Inversions.
      Mode, Duplicates, Chord Count are not affected.
      <ul>
        <li><span class="b">All the feels</span> - Turn on all selections. Weight sliders are not affected.</li>
        <li><span class="b">Reset</span> - Set the selections <i>and sliders</i> to default values.</li>
      </ul>
      
  </td>
</tr>

<tr class="bg-light-gray mhh-mat-label"><td class="b">Chord Types</td></tr>
<tr>
  <td>
      Which chord types are allowed to be generated. At least one chord type must be allowed.
      <p>Underneath each checkbox is a slider which sets the relative weighting of that chord types.</p>
      <p>The chance that a particular chord type will be chosen is dependent on the relative positions 
      of all the sliders that are active. So if all are set high (or low), then they are equally likely to
      be chosen. The different options will have different weights only if the sliders are in different positions.</p>
      <p>The sliders will show you in real-time the probability that its option will be picked.</p>
      <ul>
        <li><span class="b">Triads</span> - (default) Chords can be the "basic" triads (1,3,5)</li>
        <li><span class="b">Sus2</span> - The chord will contain the second rather than third</li>
        <li><span class="b">Sus4</span> - The chord will contain the fourth rather than third</li>
            options are also chosen</li>
        </li>
      </ul>
      
  </td>
</tr>

<tr class="bg-light-gray  mhh-mat-label"><td class="b">Extensions</td></tr>
<tr>
  <td>
      These are additional chord tones that can be added "on top" of the chord.
      <p>Underneath each checkbox is a slider which sets the probability that the associated extension
        will be added to the chord. Note that these are independent of each other. When the slider
        is far to the right, the extension is very likey to be added. Conversely, when the slider
        is far to the left, the extension is not very likely to be added.</p>      
  </td>
</tr>

<tr class="bg-light-gray mhh-mat-label"><td class="b">Inversions</td></tr>
<tr>
  <td>
      The chord will be inverted - the lowest note will be something other than the root of the chord.
      <p>Underneath each checkbox is a slider which sets the probability that the associated inversion
        will be generated.</p>
      <p>The chance that a particular inversion will be chosen is dependent on the relative positions 
      of all the sliders that are active. So if all are set high (or low), then they are equally likely to
      be chosen. The different options will have different weights only if the sliders are in different positions.</p>
      <p>The sliders will show you in real-time the probability that its option will be picked.</p>
  
      <p>At least one inversion must be allowed or an error will be generated</p>
      <p>The default weightings are the weightings that were used by the application before this change.</p>     
  </td>
</tr>

<tr class="bg-light-gray mhh-mat-label"><td class="b">Key (Diatonic Only)</td></tr>
<tr>
  <td>
    Control how the key used by the Diatonic Mode is chosen.
      <ul>
        <li><span class="b">Random</span> - (default) Let the computer decide</li>
        <li><span class="b">Selected</span> - The user selects. If chosen, another set of boxes will appear allowing you to choose
              the tonality (major, minor, dorian, etc) and the key center (or leave the key center random).</li>
      </ul>
      
  </td>
</tr>

<tr class="bg-light-gray mhh-mat-label"><td class="b">Limitations/Caveats</td></tr>
<tr><td>
<li>3rd Inversion 7ths are never generated.</li>
<li>For 9ths, the 9th is never "inverted", any inversion is calculated as if the chord was a triad or 7th.</li>
<li>In <span class="b">Chromatic</span> mode
    <ul>
        <li>Dominant 7ths are never generated</li>    
        <li>The chord qualities are weighted in the ratio they appear in a major scale.</li>  
    </ul>
</li> 
</td></tr> 

</table>
`;
const HELP_PAGE_NAME = "Random Chords";

const octavePlacement : { [ index : string ] : number } = {
  'C' : 0, 'D' : 1, 'E' : 2, 'F' : 3, 'G' : 4, 'A' : 5, 'B' : 6 
}


@Component({
  selector: 'app-random-chords',
  templateUrl: './random-chords.component.html',
  styleUrls: ['./random-chords.component.scss']
})
export class RandomChordsComponent implements OnInit {

  generateOptions : GeneratorOptions = defaultGeneratorOptions();

  default_scale : Scale | null = null;


  chords : Chord[] = [];

  show_key = true;
  show_scale = false;
  scale_notes : Note[] = [];

  all_play_active = false;

  midi_config : MidiConfig = defaultMidiConfig();

  generatorOptionsExpanded = true;
  

  constructor(private scaleService : ScaleService,
    private randomChordService : RandomChordService,
    private audioService : AudioService,
    public dialog: MatDialog, 
    private help_text : HelpTextEmitterService,
    @Inject(DOCUMENT) private document : Document,
    private preferences : PreferencesService,

    ) {

      // Do this in the constructor to make sure it is set before th view initializes.
      this.generatorOptionsExpanded = this.preferences.read('gen_opts_panel', true);
      this.generateOptions = this.preferences.read('gen_opts_data', this.generateOptions);

  }

  ngOnInit(): void {
    this.help_text.setHelp({ help_text : HELP_TEXT, page_name : HELP_PAGE_NAME });

    const midi_pref = this.preferences.read('midi', this.midi_config);

    if (! ('fileName' in midi_pref)) {
      midi_pref['fileName'] = defaultMidiConfig().fileName; 
    }

    this.midi_config = midi_pref as MidiConfig;


    // Snag any changes to the midi preferences.
    this.preferences.prefChange.pipe(filter((k)=> k === 'midi')).subscribe(() => {
      Object.assign(this.midi_config, this.preferences.read('midi', this.midi_config));

    
    });
  }

  get chords_exist() { return this.chords.length > 0; }

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

  default_scale_click(event : Event) {
    this.stopPropagation(event);

    const input_scale = (this.default_scale?.scaleID() || CMajorID() );
    const dia = this.dialog.open(ScaleChangeDialogComponent, { data : input_scale} );

    dia.afterClosed().subscribe((s) => {
      if (s) {
        this.default_scale = new Scale(s);
        this.generateOptions.scale = Object.assign({}, s);
        this.scale_notes = this.default_scale.notesOfScale();
      }
    })
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
    moveItemInArray(this.chords, evnt.previousIndex, evnt.currentIndex);
  }

  edit_chord_modal(chord_index : number, chord? : Chord) {

    // if chord is defined then we are being asked to edit them add
    // if it is NOT defined, we are being asked to edit the existing chord.

    let adding_chord = false;

    if (chord == undefined) {
      chord = this.chords[chord_index].clone()
    } else {
      adding_chord = true;
    }

    const dia = this.dialog.open(ChordEditDialogComponent, { data : chord });
    
    dia.afterClosed().subscribe((newChord) => {
      if (newChord) {
        if (adding_chord) {
          this.chords.splice(chord_index, 0, newChord.clone())
        } else {
          this.chords[chord_index] = newChord.clone();
        }
      }

    })
  }

  delete_chord(chord_index : number) {

    this.chords.splice(chord_index, 1);
  }

  chordIsCustom(chord : Chord | number) : boolean {
    if (typeof chord === 'number')
      chord = this.chords[chord];

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

    let scale : Scale = this.chords[chord_index].scale;

    if (this.chordIsCustom(chord_index) && this.default_scale) {
      scale = this.default_scale;
    }

    // override count to just do one.
    builder.setOptions(this.generateOptions)
      .setCount({min : 1, max : 1})
      .setKey(scale);

    const newChords = builder.generate_chords();

    this.chords[chord_index] = newChords[0];


  }

  set_default_scale(chord_index : number) {

    const chord_scale = this.chords[chord_index].scale;
    if (! this.default_scale?.isSame(chord_scale)) {
      this.default_scale = chord_scale;
      this.scale_notes = chord_scale.notesOfScale();
      this.generateOptions.scale = chord_scale.scaleID();
    }
  }

  set_to_default_scale(chord_index : number) {
    if (! this.default_scale) return;

    const chord = this.chords[chord_index];
    if (! this.default_scale.isSame(chord.scale)) {
      chord.change_scale(this.default_scale);
    }


  }

  async gen_list(fn? : () => void ) {
    const dia = this.dialog.open(NewListDialogComponent, { data : Object.assign({}, this.generateOptions) });

    dia.afterClosed().subscribe((opts) => {
      this.generate_options_change(opts);
      this.generate();
      this.default_scale = new Scale (this.generateOptions.scale);
      this.scale_notes = this.default_scale.notesOfScale();
      if (fn) fn();
    });
  }

  start_new_list() {
    if (this.chords_exist) {
      const dia = this.dialog.open(ConfirmActionDialogComponent, 
          { data: "Removing All Existing Chords"});

      dia.afterClosed().subscribe((confirm) => {
        if (confirm) {
          this.chords = [];
          this.generateOptions.key_source = 'Random';
          this.gen_list();
        }
      });
    } else {
      // this can't go in gen_list since that is also shared by append_to_list
      this.generateOptions.key_source = 'Random';
      this.gen_list();
    }
  }

  append_to_list() {
    const old_chords = this.chords.slice(); // copy away the old chords;
    this.generateOptions.key_source = 'Selected';
    this.generateOptions.center = this.generateOptions.scale.key_center;
    this.generateOptions.tonality = this.generateOptions.scale.type;
    this.gen_list(() => {
      this.chords = old_chords.concat(this.chords);
    });
  }

  /********   CHORD LOCKING ***************/

  lock_chord(index : number) : void {
    if (this.chords.length > index) {
      this.chords[index].keep = ! this.chords[index].keep;
    }
  }

  chord_locked(index : number) : boolean {
    if (this.chords.length > index) {
      return this.chords[index].keep;
    }

    return false;
  }

  unlock_all_chords() {
    for (const c of this.chords) {
      c.keep = false;
    }
  }

  any_chords_locked() : boolean {
    for (const c of this.chords) {
      if (c.keep) return true;
    }
    return false;
  }

  all_chords_locked() : boolean {
    for (const c of this.chords) {
      if (! c.keep) return false;
    }
    return true;
  }
   

  delete_unlocked_chords(do_it? : boolean ) {

    if (do_it) {
      this.chords = this.chords.filter((k) => k.keep);
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


  generate() {

    this.all_play_active = false;

    if (this.generateOptions.count_range_mode) {
      if (this.generateOptions.count.min > this.chord_count_max || this.generateOptions.count.min < 1) {
        return;
      }

      if (this.generateOptions.count.min > this.generateOptions.count.max) {
        this.dialog.open(ErrorDialogComponent, {
          data: "min count must be less than or equal to max chord count",
        });
        return;
      }
    } else {
      if (this.generateOptions.count.min > this.chord_count_max || this.generateOptions.count.min < 1) {
        return;
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


      if (this.any_chords_locked()) {
        this.chords = builder.generate_chords(this.chords);
      } else {
        this.chords = builder.generate_chords();
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

    if (next >=0 && next < this.chords.length) {
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

    if (next >= 0 && next < this.chords.length) {

      this.play_chord(this.chords[next], beepLength);
      last = next;
      next += 1;

      // Note, we don't check all_play_active because we would still need to unhighlight
      setTimeout(() => { this.highlight_next_chord(last, next)}, 1000 * 2 * beepLength)
    }
  }


/******************************* MIDI  *******************************************/

  private midi_state = 'off';

  get midi_disabled():boolean {
    return this.chords.length < 1;
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

    if (this.chords.length < 1) return;

    const mainTrack = new Midiwriter.Track();
    let bassTrack;
    if (config.separateBass) {
      bassTrack = new Midiwriter.Track();
    }

    let trackName = '';

    for (const c of this.chords) {
      trackName += c.name() + ' ';
    }

    if (config.includeScale) {
      trackName += this.default_scale?.fullName();
    }

    mainTrack.addTrackName(trackName);
    if (bassTrack) {
      bassTrack.addTrackName(trackName);
    }

    for (const c of this.chords) {

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
      'count' : this.chords.length,
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
