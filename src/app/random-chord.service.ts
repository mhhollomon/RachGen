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


export type DuplicateControl = 'any' | 'not-adjacent' | 'none';

export class ChordSequenceBuilder {


  // The options 
  public key : Scale | null = null;
  public min_count = 1;
  public max_count = 1;
  public duplicates : DuplicateControl = 'any';
  public chordTypes : ChordType[] = [];

  public chordList : Chord[] = [];

  public extensions : {[index : string ] : number } = {};
  public inversions : {[index : string ] : number } = {};

  invertChooser = new Chooser<InversionType>([mkch('root', 5), mkch('first', 3), mkch('second', 2)]);


  private noteChooser = equalWeightedChooser(range(1,8));
  private chromaticChooser = new Chooser(chromaticNotes.map(v => mkch(v)));
  private chordTypeChooser = new Chooser([mkch<ChordType>('triad', 1)])


  constructor(private scaleService : ScaleService) { }

  setKey(newKey : Scale | null) : ChordSequenceBuilder;
  setKey(newKey : string, scaleType : ScaleType) : ChordSequenceBuilder;
  setKey(newKey : string | Scale | null, scaleType? : ScaleType) : ChordSequenceBuilder {

    if (typeof newKey === 'string') {
      if (! scaleType) { 
        throw Error("No scale Type given with key name")
      }
      this.key = new Scale(newKey, scaleType);
    } else {
      this.key = newKey;
    }

    return this;
  }

  setCount(min : number, max? : number) : ChordSequenceBuilder {

    min = Math.floor(min);

    if (max == undefined) max=min;

    if (max < min) {
      throw Error ("max must be >= min");
    }

    if (min < 1) {
      throw Error("min must be >= 1");
    }

    this.min_count = min;
    this.max_count = max;

    return this;
  }

  setDuplicate(dc : DuplicateControl) : ChordSequenceBuilder {
    this.duplicates = dc;
    return this;
  }

  setChordTypes(ct : ChordType[]) : ChordSequenceBuilder {
    this.chordTypes = ct;

    this.chordTypeChooser = equalWeightedChooser(this.chordTypes);

    return this;
  }

  addChordType(ct : ChordType, weight = 1) : ChordSequenceBuilder {
    if (! this.chordTypes.includes(ct)) {
      this.chordTypes.push(ct);

      const choices : Choice<ChordType>[] = 
            (this.chordTypes.length > 0) ? this.chordTypeChooser.choices : [];

      choices.push(mkch(ct, weight));

      this.chordTypeChooser = new Chooser(choices);
    }
    return this;
  }

  // The weight is presumed to be out of 100
  addExtension (ext : ExtensionType, weight : number) : ChordSequenceBuilder {

    this.extensions[ext] = weight;

    return this;
  }

  addInversion(inv : InversionType, weight : number) : ChordSequenceBuilder {

    this.inversions[inv] = weight;

    return this;
  }

  generate_chords(inputChords? : Chord[]) : Chord[] {


    if (this.chordTypes.length < 1) {
      throw Error("must give at least one allowed chord type");
    }

    if (Object.keys(this.inversions).length < 1) {
      throw Error("must give at least one allowed inversion");
    }

    this.invertChooser = new Chooser<InversionType>(
      Object.keys(this.inversions).map((k, v) => mkch(k as InversionType,v))
    )

    if (inputChords) {
      this.chordList = inputChords;

      for (let index = 0; index < this.chordList.length; ++index) {
        if (this.chordList[index].keep == false) {
          this.chordList[index] = this.find_a_chord(index);
        }
      }


    } else {

      const chord_count = equalWeightedChooser(range(this.min_count, this.max_count+1)).choose();

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

      if (attempts < 1) throw Error("Could not create a nonduplicate chord after 300 tries.");

      if (this.duplicates === 'none') {
        for (let j = 0; j < this.chordList.length; ++j) {
          if (j < index || this.chordList[j].keep) {
            if (this.chordList[j].isSame(newChord)) {
              try_again = true;
            }
          }
        }
      } else  if (this.duplicates === 'not-adjacent') {
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

    if (! this.key) {
      throw("somebody goofed");
    }

    const chord = new Chord();

    const scale = this.scaleService.getScaleNotes(this.key);
    const rootDegree = this.noteChooser.choose();
    const note = scale[rootDegree-1];

    chord.setRoot(note, rootDegree);

    chord.chordType = this.chordTypeChooser.choose();


    return this.mkchord(this.key, chord);

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

    if (this.key) {
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

    if (this.extensions['7th']) {
      if (yesno100(this.extensions['7th'])) {
        chord.setExtension('7th', true);
      }
    }
    
    if (this.extensions['9th']) {
      if (yesno100(this.extensions['9th'])) {
        chord.setExtension('9th', true);
      }
    }

    if (this.extensions['11th']) {
      if (yesno100(this.extensions['11th'])) {
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
