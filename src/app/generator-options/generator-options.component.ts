import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { MatSelectChange } from '@angular/material/select';
import { defaultModeDegreeList, defaultModeList, RandomChordOptions } from '../random-chord.service';
import { ScaleService } from '../scale.service';
import { ChordType, InversionType } from '../utils/music-theory/chord';
import { ALL_SCALE_TYPES, Scale, ScaleType } from '../utils/music-theory/scale';
import { range } from '../utils/util-library';
import { defaultGeneratorOptionProps, GeneratorOptionProps, GeneratorOptions } from './GeneratorOptions';


@Component({
  selector: 'app-generator-options',
  templateUrl: './generator-options.component.html',
  styleUrls: ['./generator-options.component.scss']
})
export class GeneratorOptionsComponent {


  @Input() options : GeneratorOptionProps = defaultGeneratorOptionProps();

  @Output()optionsChange = new EventEmitter<GeneratorOptionProps>;

  get scale_disabled() : boolean {
    return false;
  }

  get chord_type_list() { return ALL_SCALE_TYPES; }


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

    if (slider === 'third') {
      total_weight += value;
    } else if (this.options.inversions['third'].flag) {
      total_weight += this.options.inversions['third'].weight;
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
    if (this.options.inversions['third'].flag) {
      this.options.inversions['third'].weight += 0.0001;
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

  mode_activate_change(event : MatRadioChange) {
    this.options.modes_on = (event.value === 'true');
    this.optionsChange.emit(this.options);

  }

  mode_list_change(mode : string, flag : boolean ) {
    const m = mode as ScaleType;

    if (flag) {
      if (!this.options.modes.includes(m)) {
        this.options.modes = this.options.modes.push(m);
      }
    } else {
      this.options.modes = this.options.modes.filter(v => v !== m);
    }
    this.optionsChange.emit(this.options);

  }

  mode_degree_list_change(d : number, flag : boolean ) {

    if (flag) {
      if (!this.options.mode_degrees.includes(d)) {
        this.options.mode_degrees = this.options.mode_degrees.push(d);
      }
    } else {
      this.options.mode_degrees = this.options.mode_degrees.filter(v => v !== d);
    }
    this.optionsChange.emit(this.options);

  }

  mode_is_on(mode : string) : boolean {
    return this.options.modes.includes(mode as ScaleType);
  }

  mode_degree_is_on(d : number) : boolean {
    return this.options.mode_degrees.includes(d);
  }


  mode_degree_list()  { return range(1,8); }

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
    this.options.inversions['third'].flag = true;

    this.optionsChange.emit(this.options);
    
  }

  set_defaults() {

    const def = defaultGeneratorOptionProps();

    Object.assign(this.options, def);

    this.optionsChange.emit(this.options);
  }

  any_chords_locked() : boolean { return false; }

  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.options.tonality as ScaleType);
  }



}
