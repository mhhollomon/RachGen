import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { List } from 'immutable';
import { Chord } from '../utils/music-theory/chord';
import { Scale } from '../utils/music-theory/scale';

@Injectable({
  providedIn: 'root'
})
export class ChordListCacheService {

  private _chords: BehaviorSubject<List<Chord>> = new BehaviorSubject(List<Chord>([]));
  private _scale : BehaviorSubject<Scale|null> = new BehaviorSubject(<Scale|null>null);

  get chords() {
    return this._chords.asObservable();
  }

  chord_list() : List<Chord> {
    return this._chords.getValue();
  }


  chord_count() { return this._chords.getValue().size; }
  move_chord(old_index : number, new_index : number) {
    let chords = this._chords.getValue();
    const chord = chords.get(old_index);

    if (! chord) return;

    chords = chords.splice(old_index, 1).splice(new_index, 0, chord);

    this._chords.next(chords);
  }

  get_a_chord(index : number) {
    return this._chords.getValue().get(index);
  }

  add_chord(c : Chord, i : number) {
    const chords = this._chords.getValue();
    if (i > chords.size) return;
    this._chords.next(chords.splice(i, 0, c));
  }

  replace_chord_list(c : Chord[] | List<Chord>) {
    this._chords.next(List(c));
  }

  replace_chord(c : Chord, i : number) {
    const chords = this._chords.getValue();
    if (i > chords.size) return;
    this._chords.next(chords.splice(i, 1, c));
  }

  delete_chord(i : number) {
    const chords = this._chords.getValue();
    if (i > chords.size) return;
    this._chords.next(chords.splice(i, 1));
  }

  append_chords(c : Chord[]) {
    this._chords.next(this.chord_list().concat(List(c)));
  }

  //******************* SCALE    ***********************/

  get scale() { return this._scale.asObservable(); }

  get_scale() { return this._scale.getValue() }
  change_scale(s : Scale | null ) {
    this._scale.next(s);
  }

  constructor() { 
    console.log("Calling the cache constructor");
  }

}
