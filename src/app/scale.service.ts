import { Injectable } from '@angular/core';
import { Choice, Chooser, mkch } from './utils/chooser';
import { Note, Scale, ScaleType } from './utils/music-theory/music-theory'


const sonorityChoices : Choice<ScaleType>[] = [
  mkch('major'), mkch('minor')
]

// Other things depend on this order (e.g. getKeyList)
// Change with care.
const sigChooser = new Chooser<number>([
  mkch(0, 20), 
  mkch(1, 17), mkch(-1, 17),
  mkch(2, 14), mkch(-2, 14),
  mkch(3,  8), mkch(-3, 14),
  mkch(4,  5), mkch(-4,  8),
]);

const sigOffset = 4;

const sigNames = {
  lydian :      [ 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G',  'D',  'A'  ],
  major  :      [ 'Ab', 'Eb', 'Bb', 'F',  'C', 'G', 'D',  'A',  'E'  ],
  mixolydian  : [ 'Eb', 'Bb', 'F',  'C',  'G', 'D', 'A',  'E',  'B'  ],
  dorian      : [ 'Bb', 'F',  'C',  'G',  'D', 'A', 'E',  'B',  'F#' ],
  minor  :      [ 'F',  'C',  'G',  'D',  'A', 'E', 'B',  'F#', 'Db' ],
  phrygian    : [ 'C',  'G',  'D',  'A',  'E', 'B', 'F#', 'Db', 'Ab' ],

}


@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  private cache : { [index: string] : Note[] } = {};

  private sonorityChooser = new Chooser(sonorityChoices);

  choose(sonority? : ScaleType ) : Scale {

    sonority = sonority ? sonority : this.sonorityChooser.choose();

    if (sonority === 'augmented' ) {
      throw Error("Cannot 'choose' with scale type augmented");
    }

    const keysig = sigChooser.choose();
    const keycenter = sigNames[sonority][keysig + sigOffset];
    return new Scale(keycenter, sonority);
  }

  getScaleNotes(scale: Scale) : Note[] {

    if (! (scale.id() in this.cache)) {
      this.cache[scale.id()] = scale.notesOfScale();
    }

    return this.cache[scale.id()];
  }


  getKeyList(sonority : ScaleType) : string[] {
    if (sonority === 'augmented' ) {
      throw Error("Cannot get the key list for scale type augmented");
    }

    return sigChooser.choices.map(v => sigNames[sonority][v.choice+sigOffset])
  }
}
