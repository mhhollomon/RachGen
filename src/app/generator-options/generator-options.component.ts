import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { RandomChordOptions } from '../random-chord.service';
import { ScaleService } from '../scale.service';
import { ChordType, InversionType } from '../utils/music-theory/chord';
import { ScaleType } from '../utils/music-theory/scale';

export interface GeneratorOptions extends RandomChordOptions {
  scale_mode : string;
  count_range_mode : boolean;
}

export interface ScaleInfo {
  source : string;
  tonality : string;
  center : string;
}

@Component({
  selector: 'app-generator-options',
  templateUrl: './generator-options.component.html',
  styleUrls: ['./generator-options.component.scss']
})
export class GeneratorOptionsComponent {


  @Input() options : GeneratorOptions = {
    scale_mode : 'Diatonic',
    scale : null, 
    count_range_mode : false,
    count : { min : 4, max : 6}, 
    duplicates : 'none',
    extensions : { 
      '7th'  : { flag : true,  weight : 25 }, 
      '9th'  : { flag : false, weight : 25 }, 
      '11th' : { flag : false, weight : 25 },
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

  @Output()optionsChange = new EventEmitter<GeneratorOptions>;

  @Output() scaleInfoChange = new EventEmitter<ScaleInfo>;

  scaleData : ScaleInfo = {source: 'Random', tonality : 'major', center : 'Random'}

  count_range_mode = false;

  get scale_disabled() : boolean {
    return this.options.scale_mode !== 'Diatonic';
  };


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

  constructor(private scaleService : ScaleService) {}

  scale_source_change(event : MatRadioChange) {
    this.scaleData.source = event.value;
    this.scaleInfoChange.emit(Object.assign({}, this.scaleData));
  }

  scale_sonority_change(event : MatSelectChange) {
    this.scaleData.tonality = event.value;
    this.scaleInfoChange.emit(this.scaleData);
  }

  scale_center_change(event : MatSelectChange) {
    this.scaleData.center = event.value;
    this.scaleInfoChange.emit(this.scaleData);
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
    
  }

  set_defaults() {
    this.options.chordTypes['triad'] = { flag : true, weight : 3};
    this.options.chordTypes['sus2'] = { flag : false, weight : 3};;
    this.options.chordTypes['sus4'] = { flag : false, weight : 3};;

    this.options.extensions['7th'] = { flag : true, weight : 25};
    this.options.extensions['9th'] = { flag : false, weight : 25};
    this.options.extensions['11th'] = { flag : false, weight : 25};

    this.options.inversions['root'] = { flag : true, weight : 5 };
    this.options.inversions['first'] = { flag : false, weight : 3 };
    this.options.inversions['second'] = { flag : false, weight : 2 };

    this.scaleData = { source : 'Random', tonality : 'Major', center : 'Random' };
    this.scaleInfoChange.emit(this.scaleData);

  }

  any_chords_locked() : boolean { return false; }

  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.scaleData.tonality as ScaleType);
  }



}
