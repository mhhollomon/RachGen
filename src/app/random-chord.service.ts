import { Injectable } from '@angular/core';
import { Choice, Chooser, equalWeightedChooser, mkch, yesno } from './utils/chooser';
import { Scale, Note, Chord, ScaleType, ChordType, ExtensionType, InversionType } from './utils/music-theory/music-theory';
import { ScaleService } from './scale.service';
import { range } from './utils/util-library';


const qualityToScaleType : { [key : string] : ScaleType } = {
  'min' : 'minor',
  'maj' : 'major',
  'dim' : 'phrygian',
  'aug' : 'augmented'
}

function yesno100(yesWeight : number) : boolean {
  return yesno(yesWeight, 100-yesWeight);
}


/* This is for Chromatic generation - much simpler */

const chromaticNotes = ['A', 'Bb', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'Ab'];
const chromaticQualityChooser = new Chooser([ mkch('min', 3), mkch('maj', 3), mkch('dim', 1), mkch('aug', 1) ]);

export class RandomChordError extends Error {
  constructor(m : string) {
    super(m)
  }
}


export type DuplicateControl = 'any' | 'not-adjacent' | 'none';

export interface WeightedFlag {
  flag : boolean;
  weight : number;
}

export interface RandomChordCountConfig {
  min : number;
  max : number | null;
}

export interface ExtensionConfg {
  '7th'  : WeightedFlag;
  '9th'  : WeightedFlag;
  '11th' : WeightedFlag;
}

export interface InversionConfg {
  'root'   : WeightedFlag;
  'first'  : WeightedFlag;
  'second' : WeightedFlag;
}

export interface ChordTypeConfig {
  'triad' : WeightedFlag;
  'sus2'  : WeightedFlag;
  'sus4'  : WeightedFlag;
}

export interface RandomChordOptions {
  scale : Scale | null; // If scale is null, the we operate in Chromatic Mode
  count : RandomChordCountConfig;
  duplicates : DuplicateControl;
  extensions : ExtensionConfg;
  inversions : InversionConfg;
  chordTypes : ChordTypeConfig;
}

export class ChordSequenceBuilder {

  // The options 
  options : RandomChordOptions = { 
    scale : null, 
    count : { min : 1, max : 1}, 
    duplicates : 'any',
    extensions : { 
        '7th' : {flag : false, weight : 0}, 
        '9th' : {flag : false, weight : 0}, 
        '11th' : {flag : false, weight : 0},
      },
    inversions : {
      'root'   : { flag : true, weight : 5 },
      'first'  : { flag : false, weight : 3 },
      'second' : { flag : false, weight : 2 },
    },
    chordTypes : {
      'triad' : { flag : true, weight : 3 },
      'sus2'  : { flag : false, weight : 3 },
      'sus4'  : { flag : false, weight : 3 },
    }
  }

  public chordList : Chord[] = [];


  private invertChooser = new Chooser<InversionType>([]);
  private chordTypeChooser = new Chooser<ChordType>([])

  private noteChooser = equalWeightedChooser(range(1,8));
  private chromaticChooser = new Chooser(chromaticNotes.map(v => mkch(v)));


  constructor(private scaleService : ScaleService) { }

  setOptions(cfg : RandomChordOptions) : ChordSequenceBuilder {

    // Calling lower level methods so I don't have to
    // duplicate validations.
    //
    this.setKey(cfg.scale)
      .setCount(cfg.count)
      .setDuplicate(cfg.duplicates)
      .setExtension('7th', cfg.extensions['7th'])
      .setExtension('9th', cfg.extensions['9th'])
      .setExtension('11th', cfg.extensions['11th'])
      .setChordTypes(cfg.chordTypes)

    return this;
  }

  setKey(newKey : Scale | null) : ChordSequenceBuilder;
  setKey(newKey : string, scaleType : ScaleType) : ChordSequenceBuilder;
  setKey(newKey : string | Scale | null, scaleType? : ScaleType) : ChordSequenceBuilder {

    if (typeof newKey === 'string') {
      if (! scaleType) { 
        throw new RandomChordError("No scale Type given with key name")
      }
      this.options.scale = new Scale(newKey, scaleType);
    } else {
      this.options.scale = newKey;
    }

    return this;
  }

  setCount(lower : RandomChordCountConfig) : ChordSequenceBuilder;
  setCount(lower : number, max? : number)  : ChordSequenceBuilder;
  setCount(lower : RandomChordCountConfig | number, upper? : number) : ChordSequenceBuilder {

    let min = 0;
    let max = 0;
    if (typeof lower === 'number') {
      min = lower;
      if (! upper ) {
        max = min;
      } else {
        max = upper;
      }
    } else {
      min = lower.min;
      if (! lower.max) {
        max = min;
      } else {
        max = lower.max;
      }
    }

    min = Math.floor(min);
    max = Math.floor(max);


    if (max < min) {
      throw new RandomChordError ("max must be >= min");
    }

    if (min < 1) {
      throw new RandomChordError("min must be >= 1");
    }

    this.options.count.min = min;
    this.options.count.max = max;

    return this;
  }

  setDuplicate(dc : DuplicateControl) : ChordSequenceBuilder {
    this.options.duplicates = dc;
    return this;
  }

  setChordTypes(ct : ChordTypeConfig) : ChordSequenceBuilder {

    Object.keys(ct).forEach((k) => {

      const cfg = ct[k as ChordType];

      if (cfg.flag) {
        if (cfg.weight <= 0)
          throw new RandomChordError("weight must be >= 1");
        this.options.chordTypes[k as ChordType] = { flag : true, weight : cfg.weight}
      } else {
        this.options.chordTypes[k as ChordType] = { flag : false, weight : 0}
      }

    } );

    return this;
  }

  addChordType(ct : ChordType, weight = 1) : ChordSequenceBuilder {

    if (weight <= 0 )
      throw new RandomChordError("weight must be >= 0");

    this.options.chordTypes[ct] = { flag : true, weight : weight}

    return this;
  }

  // The weight is presumed to be out of 100
  addExtension (ext : ExtensionType, weight : number) : ChordSequenceBuilder {

    if (weight <= 0 || weight > 100) {
      throw new RandomChordError("Extension weight must be 0 < weight <= 100");
    }

    this.options.extensions[ext] = { flag: true, weight : weight};

    return this;
  }

  removeExtension(ext : ExtensionType) : ChordSequenceBuilder {

    this.options.extensions[ext] = { flag: false, weight : 0};

    return this;
  }

  setExtension(ext : ExtensionType, cfg : WeightedFlag) : ChordSequenceBuilder {

    let weight = 0;

    if (cfg.flag) {
      weight = cfg.weight
      if (weight <= 0 || weight > 100) {
        throw new RandomChordError("Extension weight must be 0 < weight <= 100");
      }  
    }

    this.options.extensions[ext] = { flag: cfg.flag, weight : weight};

    return this;
  }

  addInversion(inv : InversionType, weight : number) : ChordSequenceBuilder {

    this.setInversion(inv, { flag : true, weight : weight });

    return this;
  }

  setInversion(inv : InversionType, cfg : WeightedFlag) : ChordSequenceBuilder {

    if (cfg.flag) {
      if (cfg.weight <= 0)
        throw new RandomChordError("Weight must be >= 0")
    }


    this.options.inversions[inv] = { flag : cfg.flag, weight : cfg.weight };

    return this;
  }

  private anyInversion() : boolean {
    let retval = false;

    // Yea, this is longer than a striaght enumeration, but it is future proof
    Object.keys(this.options.inversions).forEach((k) => retval ||= this.options.inversions[k as InversionType].flag );

    return retval;
  }

  private anyChordType() : boolean {
    let retval = false;

    // Yea, this is longer than a striaght enumeration, but it is future proof
    Object.keys(this.options.chordTypes).forEach((k) => retval ||= this.options.chordTypes[k as ChordType].flag );

    return retval;
  }

  generate_chords(inputChords? : Chord[]) : Chord[] {


    if (! this.anyChordType()) {
      throw new RandomChordError("must give at least one allowed chord type");
    }

    if (! this.anyInversion()) {
      throw new RandomChordError("must give at least one allowed inversion");
    }

    const inversionChoices = Object.keys(this.options.inversions)
          .filter((k) => this.options.inversions[k as InversionType].flag)
          .map((k) => mkch(k as InversionType, this.options.inversions[k as InversionType].weight))

    this.invertChooser = new Chooser<InversionType>(inversionChoices);

    const chordTypeChoices = Object.keys(this.options.chordTypes)
          .filter((k) => this.options.chordTypes[k as ChordType].flag)
          .map((k) => mkch(k as ChordType, this.options.chordTypes[k as ChordType].weight))

    this.chordTypeChooser = new Chooser<ChordType>(chordTypeChoices);

    if (inputChords) {
      this.chordList = inputChords;

      for (let index = 0; index < this.chordList.length; ++index) {
        if (this.chordList[index].keep == false) {
          this.chordList[index] = this.find_a_chord(index);
        }
      }


    } else {

      const max = this.options.count.max || this.options.count.min;

      const chord_count = equalWeightedChooser(range(this.options.count.min, max+1)).choose();

      this.chordList = [];

      for (let index = 0; index < chord_count; ++index) {
        this.chordList.push(this.find_a_chord(index));
      }
    }

    return this.chordList;
  }

  /* This tries to find a chord that meets the duplicates criteria */
  find_a_chord(index : number) : Chord {

    let try_again = true;
    let newChord = new Chord();
    let attempts = 300;
    while (try_again) {
      newChord = this.gen_one_chord();
      try_again = false;
      attempts -= 1;

      if (attempts < 1) throw new RandomChordError("Could not create a nonduplicate chord after 300 tries.");

      if (this.options.duplicates === 'none') {
        for (let j = 0; j < this.chordList.length; ++j) {
          if (j < index || this.chordList[j].keep) {
            if (this.chordList[j].isSame(newChord)) {
              try_again = true;
            }
          }
        }
      } else  if (this.options.duplicates === 'not-adjacent') {
        // look to the left
        if (index > 0 && this.chordList[index-1].isSame(newChord)) {
          try_again = true;

        //look to the right
      } else if (index < this.chordList.length-1 && 
              this.chordList[index+1].keep && this.chordList[index+1].isSame(newChord) ) {
          try_again = true;
        }
      } 
    }

    return newChord;
  }

  private gen_diatonic_chord() {

    if (! this.options.scale) {
      throw("somebody goofed");
    }

    const chord = new Chord();

    const scale = this.scaleService.getScaleNotes(this.options.scale);
    const rootDegree = this.noteChooser.choose();
    const note = scale[rootDegree-1];

    chord.setRoot(note, rootDegree);

    chord.chordType = this.chordTypeChooser.choose();


    return this.mkchord(this.options.scale, chord);

  }

  private gen_chromatic_chord() : Chord {

    const note = new Note(this.chromaticChooser.choose());
    const chQual = chromaticQualityChooser.choose();

    const chord = new Chord();

    chord.chordType = this.chordTypeChooser.choose();

    const scale = new Scale(note, qualityToScaleType[chQual]);
    chord.setRoot(note, 1);

    return this.mkchord(scale, chord);
  }

  gen_one_chord() : Chord {

    if (this.options.scale) {
      return this.gen_diatonic_chord();
    } else {
      return this.gen_chromatic_chord();
    }

  }

  private mkchord(key : Scale, chord : Chord) : Chord {

    chord.setScale(key)
        .setInversion(this.invertChooser.choose())


    // The chord quality is a diminished - can't have a sus chord.
    if ((chord.chordType === 'sus2' || chord.chordType === 'sus4') && 
            chord.isDim()) {
      chord.chordType = 'triad';
    }

    if (this.options.extensions['7th'].flag) {
      if (yesno100(this.options.extensions['7th'].weight)) {
        chord.setExtension('7th', true);
      }
    }
    
    if (this.options.extensions['9th'].flag) {
      if (yesno100(this.options.extensions['9th'].weight)) {
        chord.setExtension('9th', true);
      }
    }

    if (this.options.extensions['11th'].flag) {
      if (yesno100(this.options.extensions['11th'].weight)) {
        chord.setExtension('11th', true);
      }
    }


    return chord;

  }

}

/********************************************************
 * The SERVICE
 * 
 */
@Injectable({
  providedIn: 'root'
})
export class RandomChordService {

  constructor(private scaleService : ScaleService) { }

  builder() : ChordSequenceBuilder {
    return new ChordSequenceBuilder(this.scaleService);
  }

}
