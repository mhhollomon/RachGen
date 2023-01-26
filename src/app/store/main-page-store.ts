import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable } from "rxjs";

import { Chord } from "../utils/music-theory/chord";
import { Scale } from "../utils/music-theory/scale";


export interface MainPageState {
    default_scale : Scale | null;
    chord_list : Chord[];
}

@Injectable()
export class MainPageStore extends ComponentStore<MainPageState> {

    // for now
    constructor() {
        super({ default_scale : null, chord_list : [] });
    }

    // --------- SELECTORS -------------------------
    readonly default_scale$: Observable<Scale | null> = this.select(state => state.default_scale);

    readonly chord_list$: Observable<Chord[]> = this.select(state => state.chord_list);

    // -------- UPDATERS ----------------------------
    readonly change_scale = this.updater((state, scale : Scale ) => ({
        ...state,
        default_scale : scale,
      }));

    readonly replace_chord = this.updater<{chord : Chord, index : number}>((state, v ) => {
        const newList : Chord[] = [...state.chord_list];
        newList[v.index] = v.chord;
        return {
            ...state,
            chord_list : newList,
        }
    });
       
    readonly insert_chord = this.updater<{chord : Chord, index : number}>((state, v ) => {
        const newList : Chord[] = [...state.chord_list];
        newList.splice(v.index, 0, v.chord);
        return {
            ...state,
            chord_list : newList,
        }
    });

    readonly move_chord = this.updater<{before : number, after : number}>((state, v ) => {
        const newList : Chord[] = [...state.chord_list];
        const deleted = newList.splice(v.before, 1);
        newList.splice(v.after, 0, deleted[0]);
        return {
            ...state,
            chord_list : newList,
        }
    });

    readonly delete_chord = this.updater((state, index : number) => {
        const newList : Chord[] = [...state.chord_list];
        newList.splice(index, 1);
        return {
            ...state,
            chord_list : newList,
        }    
    });

    readonly append_chords = this.updater((state, newList : Chord[]) => ({
        ...state,
        chord_list : [...state.chord_list, ...newList],

    }));

    readonly replace_chord_list = this.updater((state, newList : Chord[]) => ({
        ...state,
        chord_list : [...newList],

    }));

    readonly unlock_all_chords = this.updater((state) => ({
        ...state,
        chord_list : state.chord_list.map(c => { c.keep = !c.keep; return c}),

    }));


    readonly delete_unlocked_chords = this.updater((state) => ({
        ...state,
        chord_list : state.chord_list.filter(c => c.keep),

    }));
}
