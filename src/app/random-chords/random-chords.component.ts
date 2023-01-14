import { Component, Inject, OnInit } from '@angular/core';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { saveAs } from 'file-saver';
import  * as Midiwriter  from 'midi-writer-js'

import { HelpTextEmitterService } from '../services/help-text-emitter.service';
import {ScaleService } from '../scale.service';
import { RandomChordService, DuplicateControl } from '../random-chord.service';
import { Chord, ChordType, InversionType } from '../utils/music-theory/music-theory';
import { Note, Scale, ScaleType } from '../utils/music-theory/music-theory';
import { AudioService } from '../audio.service';
import { DOCUMENT } from '@angular/common';
import { ThemeService } from '../services/theme.service';


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

  key : Scale = new Scale('C', 'major');

  chords : Chord[] = [];

  show_chords = false;
  show_key = true;
  show_scale = false;
  show_chord_tones = true;
  scale_disabled = false;
  scale_notes : Note[] = [];

  new_chord_tones = true;

  min_chord_count = 3;
  max_chord_count = 5;
  count_range_mode = false;

  duplicates : DuplicateControl = 'none';
  mode  = 'Diatonic';
  scale_source  = "Random";

  allow_triads = true;
  triad_weight = 3;

  allow_sus2 = false;
  sus2_weight = 3;

  allow_sus4 = false;
  sus4_weight = 3;

  allow_sevenths = false;
  sevenths_weight = 50;

  allow_ninths = false;
  ninths_weight = 50;

  allow_elevenths = false;
  elevenths_weight = 50;

  allow_root_inv = true;
  root_inv_weight = 5;

  allow_first_inv = true;
  first_inv_weight = 3;

  allow_scnd_inv = true;
  scnd_inv_weight = 2;

  selected_sonority  = 'major';
  selected_key  = 'Random';

  all_play_active = false;
  

  constructor(private scaleService : ScaleService,
    private randomChordService : RandomChordService,
    private audioService : AudioService,
    public error_dialog: MatDialog, 
    private help_text : HelpTextEmitterService,
    @Inject(DOCUMENT) private document : Document,
    private theme_service : ThemeService,

    ) {

  }

  ngOnInit(): void {
    this.help_text.setHelp({ help_text : HELP_TEXT, page_name : HELP_PAGE_NAME });
  }

  get chord_count_max() : number {
    if (this.duplicates !== 'none') {
      return 30;
    }

    let types = 0;
    if (this.allow_triads) types += 1;
    if (this.allow_sus2) types += 1;
    if (this.allow_sus4) types += 1;

    if (types > 1) {
      return 10;
    }
    
    return 6;
  }

  get all_play_disabled():boolean {
    return this.all_play_active;
  }


  getPanelTitle() : string {

    let retval = this.mode;
    
    if (this.mode === 'Diatonic' && this.show_chords) {
        retval = this.key.fullDisplay();    
    }

    return retval;
  }

  stopPropagation(evnt : Event) {
    evnt.stopPropagation();
  }

  chord_tone_change(evnt : Event) {

    this.stopPropagation(evnt);

    this.show_chord_tones = ! this.show_chord_tones;
  }

  range_mode_change() {
    this.count_range_mode = ! this.count_range_mode;

    if (this.count_range_mode) {
      if (this.min_chord_count > this.max_chord_count) {
        const temp = this.min_chord_count;
        this.min_chord_count = this.max_chord_count;
        this.max_chord_count = temp;
      }

    }
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


  yesno_slider_ticks(value : number) : string {
    return '' + value + '%';
  }


  /************** INVERSION SLIDER FUNCTIONS  **************/

  inversion_slider_ticks(slider : InversionType, value : number) : string {

    let total_weight = 0;

    if (slider === 'root') {
      total_weight += value;
    } else if (this.allow_root_inv) {
      total_weight += this.root_inv_weight;
    }


    if (slider === 'first') {
      total_weight += value;
    } else if (this.allow_first_inv) {
      total_weight += this.first_inv_weight;
    }


    if (slider === 'second') {
      total_weight += value;
    } else if (this.allow_scnd_inv) {
      total_weight += this.scnd_inv_weight;
    }

    const weight = Math.floor(100*value/total_weight);

    return '' + weight + '%';

  }

  mk_inv_slider_func(inv : InversionType) {
    return (value : number)  => { return this.inversion_slider_ticks(inv, value); }
  }


  // This is to get around a problem that the value
  // labels (produced by chord_type_slider_ticks)
  // is cached by the slider itself. So when turn on
  // (or off) an option, it doesn't update the label until
  // you move the slider.
  // This basically artifically moves the slider by updating
  // the model.
  inv_checkbox_change() {
    if (this.allow_root_inv) {
      this.root_inv_weight += 0.0001;
    }
    if (this.allow_first_inv) {
      this.first_inv_weight += 0.0001;
    }
    if (this.allow_scnd_inv) {
      this.scnd_inv_weight += 0.0001;
    }
  }

  /************** CHORRD TYPE  SLIDER FUNCTIONS  **************/

  chord_type_slider_ticks(slider : ChordType, value : number) : string {

    let total_weight = 0;

    if (slider === 'triad') {
      total_weight += value;
    } else if (this.allow_triads) {
      total_weight += this.triad_weight;
    }


    if (slider === 'sus2') {
      total_weight += value;
    } else if (this.allow_sus2) {
      total_weight += this.sus2_weight;
    }


    if (slider === 'sus4') {
      total_weight += value;
    } else if (this.allow_sus4) {
      total_weight += this.sus4_weight;
    }

    const weight = Math.floor(100*value/total_weight);

    return '' + weight + '%';

  }

  mk_ct_slider_func(ct : ChordType) {
    return (value : number)  => { return this.chord_type_slider_ticks(ct, value); }
  }


  // This is to get around a problem that the value
  // labels (produced by chord_type_slider_ticks)
  // is cached by the slider itself. So when turn on
  // (or off) an option, it doesn't update the label until
  // you move the slider.
  // This basically artifically moves the slider by updating
  // the model.
  ct_checkbox_change() {
    if (this.allow_triads) {
      this.triad_weight += 0.0001;
    }
    if (this.allow_sus2) {
      this.sus2_weight += 0.0001;
    }
    if (this.allow_sus4) {
      this.sus4_weight += 0.0001;
    }
  }


  turn_on_all() {
    this.allow_triads = true;
    this.allow_sus2 = true;
    this.allow_sus4 = true;

    this.allow_sevenths = true;
    this.allow_ninths = true;
    this.allow_elevenths = true;

    this.allow_root_inv = true;
    this.allow_first_inv = true;
    this.allow_scnd_inv = true;
    
  }

  set_defaults() {
    this.allow_triads = true;
    this.triad_weight = 3;
    this.allow_sus2 = false;
    this.sus2_weight = 3;
    this.allow_sus4 = false;
    this.sus4_weight = 3;

    this.allow_sevenths = false;
    this.sevenths_weight = 50;
    this.allow_ninths = false;
    this.ninths_weight = 50;
    this.allow_elevenths = false;
    this.elevenths_weight = 50;

    this.allow_root_inv = true;
    this.root_inv_weight = 5;
    this.allow_first_inv = true;
    this.first_inv_weight = 3;
    this.allow_scnd_inv = true;
    this.scnd_inv_weight = 2;

  }


  generate() {

    if (this.count_range_mode) {
      if (this.max_chord_count > this.chord_count_max || this.min_chord_count < 1) {
        return;
      }
    } else {
      if (this.min_chord_count > this.chord_count_max || this.min_chord_count < 1) {
        return;
      }

    }

    if (this.count_range_mode && this.min_chord_count > this.max_chord_count) {
      this.error_dialog.open(ErrorDialogComponent, {
        data: "min count must be less than or equal to max chord count",
      });

      return;

    }

    let picked_key : Scale | null = null;

    if (this.mode === 'Diatonic') {

      if (this.scale_source === "Selected") {
        if (this.selected_key === 'Random') {
          this.key = this.scaleService.choose(this.selected_sonority as ScaleType);
        } else {
          this.key = new Scale(this.selected_key, this.selected_sonority as ScaleType);
        }
        } else {
          this.key = this.scaleService.choose();
        }
      this.scale_notes = this.scaleService.getScaleNotes(this.key);
      picked_key = this.key;
      this.show_key = true;

    } else {

      // -- Chromatic Mode
      this.show_key = false;
      this.scale_notes = [];
      
    }

    try {
      const builder = this.randomChordService.builder();

      if (this.allow_triads) builder.addChordType('triad', this.triad_weight);
      if (this.allow_sus2) builder.addChordType('sus2', this.sus2_weight);
      if (this.allow_sus4) builder.addChordType('sus4', this.sus4_weight);

      if (this.allow_sevenths) builder.addExtension('7th', this.sevenths_weight);
      if (this.allow_ninths) builder.addExtension('9th', this.ninths_weight);
      if (this.allow_elevenths) builder.addExtension('11th', this.elevenths_weight);

      if (this.allow_root_inv) builder.addInversion('root', this.root_inv_weight);
      if (this.allow_first_inv) builder.addInversion('first', this.first_inv_weight);
      if (this.allow_scnd_inv) builder.addInversion('second', this.scnd_inv_weight);

      builder.setCount(this.min_chord_count, this.count_range_mode ? this.max_chord_count : this.min_chord_count);

      builder.setDuplicate(this.duplicates)
          .setKey(picked_key);

      if (this.any_chords_locked()) {
        this.chords = builder.generate_chords(this.chords);
      } else {
        this.chords = builder.generate_chords();
      }

      this.show_chords = true;
      /*
      for (const c in this.chords) {
        console.log(c, this.chords[c]);
      }
      */
    } catch(e) {
      let error_msg = 'oopsy - unknown error';
      if (typeof e === "string") {
        error_msg = e;
      } else if (e instanceof Error) {
          error_msg = e.message;
          if (e.stack) {
            error_msg += "\n" + e.stack;
          }

        this.error_dialog.open(ErrorDialogComponent, {
          data: error_msg,
        });

      }
    }

  }

  /************** AUDIO  **************/

  async play_chord(chord : Chord, seconds? : number) {

    const tones : string[] = [];
    let octave = 3;
    let last  = -1;
    let isBassNote = true;

    for (const c of chord.invertedChordTones()) {

      const simpleNote = c.toSharp();

      if (octavePlacement[simpleNote.noteClass] < last) {
        octave += 1;
      }
      tones.push(simpleNote.note() + octave);
      if (isBassNote) {
        octave += 1;
        isBassNote = false;
      } else {
        last = octavePlacement[simpleNote.noteClass];
      }

    }
  
    await this.audioService.play_chord(tones, seconds);

    return '';

  }

  async play_all_chords() {

    this.all_play_active = true;
    setTimeout(() => { this.highlight_next_chord(-99, 0)});
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
      setTimeout(() => { this.highlight_next_chord(last, next)}, 1000 * 2 * beepLength)
    }
  }
  

  generate_midi(evnt : Event) {

    this.stopPropagation(evnt);

    const track = new Midiwriter.Track();

    if (!this.show_chords || this.chords.length < 1) return;

    for (const c of this.chords) {

      // Want to place the bass note "down an octave"
      let octave = 3;
      let last  = -1;
      let isBassNote = true;
  
      const options : Midiwriter.Options = {sequential: false, duration : '1', pitch : []}

      for (const n of c.invertedChordTones()) {

        const simpleNote = n.toSharp();
        if (octavePlacement[simpleNote.noteClass] < last) {
          octave += 1;
        }
        (options.pitch as unknown as string[]).push(simpleNote.note() + octave );
        if (isBassNote) {
          octave += 1;
          isBassNote = false;
        } else {
          last = octavePlacement[simpleNote.noteClass];
        }
  
      }

      track.addEvent(new Midiwriter.NoteEvent(options))
    }

    if (this.mode === 'Diatonic' ) {

      let octave = ['G', 'A', 'B'].includes(this.scale_notes[0].toSharp().noteClass) ? 3 : 4;
      let last  = -1;
      const scale_options : Midiwriter.Options = {sequential: true, duration : '4', pitch : []}
      for (const n of this.scale_notes) {

        const simpleNote = n.toSharp();


        if (octavePlacement[simpleNote.noteClass] < last) {
          octave += 1;
        }
        (scale_options.pitch as unknown as string[]).push(simpleNote.note() + octave );
        last = octavePlacement[simpleNote.noteClass];
      }

      track.addEvent(new Midiwriter.NoteEvent(scale_options))

    }


    const midi_writer = new Midiwriter.Writer(track);

    const  blob = new Blob([midi_writer.buildFile()], {type: "audio/midi"});
    saveAs(blob, "random-chords.mid");

  }

  mode_change() {
    this.show_chords = false;
    this.chords = [];
    if (this.mode == "Diatonic" ) {
      this.show_key = true;
      this.scale_disabled = false;
    } else {
      this.show_key = false;
      this.scale_disabled = true;
    }
  }

  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.selected_sonority as ScaleType);
  }

}
