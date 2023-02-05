import { Injectable } from '@angular/core';
import { Choice, Chooser, mkch } from './utils/chooser';
import { Scale, ScaleType } from './utils/music-theory/scale';
import { Note } from './utils/music-theory/note';


const sonorityChoices : Choice<ScaleType>[] = [
  mkch('major'), mkch('minor')
]

// Other things depend on this order (e.g. getKeyList)
// Change with care.
const sigChooser = new Chooser<number>([
  mkch(0, 20), 
  mkch(1, 17), mkch( 2, 17),
  mkch(3, 14), mkch( 4, 14),
  mkch(5,  8), mkch( 6, 14),
  mkch(7,  5), mkch( 8,  5),
  mkch(9,  5), mkch(10,  8),
]);

const sigNames =  [ 'C', 'G', 'F', 'D', 'Bb', 'A', 'Eb', 'E', 'Ab', 'B', 'Db', 'F#', 'Gb' ];

@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  private cache : { [index: string] : Note[] } = {};

  private sonorityChooser = new Chooser(sonorityChoices);

  choose(sonority? : ScaleType ) : Scale {

    sonority = sonority ? sonority : this.sonorityChooser.choose();

    const keysig = sigChooser.choose();
    const keycenter = sigNames[keysig];
    return new Scale({ center : keycenter, type : sonority });
  }

  getKeyList(sonority : ScaleType) : string[] {
    return sigChooser.choices.map(v => sigNames[v.choice])
  }
}
