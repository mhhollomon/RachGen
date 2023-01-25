import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { RandomChordOptions } from '../random-chord.service';
import { ScaleService } from '../scale.service';
import { ChordType, InversionType } from '../utils/music-theory/chord';
import { Scale, ScaleType } from '../utils/music-theory/scale';

export interface GeneratorOptions extends RandomChordOptions {
  count_range_mode : boolean;
  key_source : string;
  tonality : string;
  center : string;
}


export function defaultGeneratorOptions() : GeneratorOptions {
  return {
    count_range_mode : false,
    key_source : 'Random',
    tonality : 'major',
    center : 'Random',

    scale : new Scale(), 
    count : { min : 4, max : 6}, 
    duplicates : 'none',
    extensions : { 
      '7th'  : { flag : true,  weight : 30 }, 
      '9th'  : { flag : false, weight : 30 }, 
      '11th' : { flag : false, weight : 30 },
    },
    inversions : {
      'root'   : { flag : true,  weight : 5 },
      'first'  : { flag : false, weight : 3 },
      'second' : { flag : false, weight : 2 },
    },
    chordTypes : {
      'triad' : { flag : true,  weight : 3 },
      'sus2'  : { flag : false, weight : 3 },
      'sus4'  : { flag : false, weight : 3 },
    }  
  }
}

@Component({
  selector: 'app-generator-options',
  templateUrl: './generator-options.component.html',
  styleUrls: ['./generator-options.component.scss']
})
export class GeneratorOptionsComponent {


  @Input() options : GeneratorOptions = defaultGeneratorOptions();

  @Output()optionsChange = new EventEmitter<GeneratorOptions>;

  get scale_disabled() : boolean {
    return false;
  }


  get chord_count_max() : number {
    if (this.options.duplicates !== 'none') {
      return 30;
    }

    let types = 0;
    if (this.options.chordTypes['triad'].flag) types += 1;
    if (this.options.chordTypes['sus2'].flag) types += 1;
    if (this.options.chordTypes['sus4'].flag) types += 1;

    if (types > 1) {
      return 10;
    }
    
    return 6;
  }

  // Need to set a level of indirection on these
  get inversions() { return this.options.inversions; }
  get extensions() { return this.options.extensions; }
  get chordTypes() { return this.options.chordTypes; }
  get count() { return this.options.count; }
  get count_range_mode() { return this.options.count_range_mode; }
  set count_range_mode(m : boolean) { this.options.count_range_mode = m; }

  get duplicates() { return this.options.duplicates; }

  constructor(private scaleService : ScaleService) {}

  scale_source_change(event : MatRadioChange) {
    this.options.key_source = event.value;
    this.optionsChange.emit(Object.assign({}, this.options));
  }

  scale_sonority_change(event : MatSelectChange) {
    this.options.tonality = event.value;
    this.optionsChange.emit(Object.assign({}, this.options));
  }

  scale_center_change(event : MatSelectChange) {
    this.options.center = event.value;
    this.optionsChange.emit(Object.assign({}, this.options));
  }

  duplicate_change(event : MatSelectChange) {
    this.options.duplicates = event.value;
    this.optionsChange.emit(Object.assign({}, this.options));
  }

  range_mode_change() {
    this.options.count_range_mode = ! this.options.count_range_mode;

    if (this.options.count_range_mode) {
      if (this.options.count.min > this.options.count.max) {
        const temp = this.options.count.min;
        this.options.count.min = this.options.count.max;
        this.options.count.max = temp;
      }
    }

    this.optionsChange.emit(this.options);
  }

  yesno_slider_ticks(value : number) : string {
    return '' + value + '%';
  }


  /************** INVERSION SLIDER FUNCTIONS  **************/

  inversion_slider_ticks(slider : InversionType, value : number) : string {

    let total_weight = 0;

    if (slider === 'root') {
      total_weight += value;
    } else if (this.options.inversions['root'].flag) {
      total_weight += this.options.inversions['root'].weight;
    }


    if (slider === 'first') {
      total_weight += value;
    } else if (this.options.inversions['first'].flag) {
      total_weight += this.options.inversions['first'].weight;
    }


    if (slider === 'second') {
      total_weight += value;
    } else if (this.options.inversions['second'].flag) {
      total_weight += this.options.inversions['second'].weight;
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
    if (this.options.inversions['root'].flag) {
      this.options.inversions['root'].weight += 0.0001;
    }
    if (this.options.inversions['first'].flag) {
      this.options.inversions['first'].weight += 0.0001;
    }
    if (this.options.inversions['second'].flag) {
      this.options.inversions['second'].weight += 0.0001;
    }
  }

  /************** CHORD TYPE SLIDER FUNCTIONS  **************/

  chord_type_slider_ticks(slider : ChordType, value : number) : string {

    let total_weight = 0;

    if (slider === 'triad') {
      total_weight += value;
    } else if (this.options.chordTypes['triad'].flag) {
      total_weight += this.options.chordTypes['triad'].weight;
    }


    if (slider === 'sus2') {
      total_weight += value;
    } else if (this.options.chordTypes['sus2'].flag) {
      total_weight += this.options.chordTypes['sus2'].weight;
    }


    if (slider === 'sus4') {
      total_weight += value;
    } else if (this.options.chordTypes['sus4'].flag) {
      total_weight += this.options.chordTypes['sus4'].weight;
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
    if (this.options.chordTypes['triad'].flag) {
      this.options.chordTypes['triad'].weight += 0.0001;
    }
    if (this.options.chordTypes['sus2'].flag) {
      this.options.chordTypes['sus2'].weight += 0.0001;
    }
    if (this.options.chordTypes['sus4'].flag) {
      this.options.chordTypes['triad'].weight += 0.0001;
    }

    this.optionsChange.emit(this.options);

  }


  turn_on_all() {
    this.options.chordTypes['triad'].flag = true;
    this.options.chordTypes['sus2'].flag = true;
    this.options.chordTypes['sus4'].flag = true;

    this.options.extensions['7th'].flag = true;
    this.options.extensions['9th'].flag = true;
    this.options.extensions['11th'].flag = true;

    this.options.inversions['root'].flag = true;
    this.options.inversions['first'].flag = true;
    this.options.inversions['second'].flag = true;

    this.optionsChange.emit(this.options);
    
  }

  set_defaults() {

    const def = defaultGeneratorOptions();

    Object.assign(this.options, def);

    this.optionsChange.emit(this.options);
  }

  any_chords_locked() : boolean { return false; }

  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.options.tonality as ScaleType);
  }



}
