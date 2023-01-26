import { Injectable, OnInit } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable } from "rxjs";
import { CustomChord } from "../utils/custom-chord";

import { Chord, NamedNoteList } from "../utils/music-theory/chord";
import { Note } from "../utils/music-theory/note";
import { Scale } from "../utils/music-theory/scale";


export interface MainPageState {
    default_scale : Scale | null;
    chord_list : NamedNoteList[];
}

function defaultState() {
    return { default_scale : null, chord_list : [] };
}
const store_key = 'rg.MainPageStore';

@Injectable()
export class MainPageStore extends ComponentStore<MainPageState> implements OnInit {

    // for now
    constructor() {

        const jsblob = localStorage.getItem(store_key);
        const props = defaultState();

        if (jsblob != null) {
            const blob_obj = JSON.parse(jsblob, (key, v) => {
                if (key === 'default_scale' ) return new Scale(v);
                if (key === 'scale' ) return new Scale(v);
                if (key === '.s.c.' ) return new Chord(v['scale'], v['degree'], v['chordType'], v['inversion']);
                if (key === '.c.c.') return new CustomChord(v['_notes'], v['_name']);
                if (key === 'chord_list') {
                    return v.map((item : any) => {for (let ik in item) {return item[ik]}});
                }
                if (key === '_notes') {
                    return v.map((item : any) => { return new Note(item['_noteClass'], item['_alter']) });
                }
                return v;
            });

            for (const k in blob_obj) {
                if (props.hasOwnProperty(k)) {
                    (props as any)[k] = blob_obj[k];
                }
            }
        }

        super(props);

        this.all_state$.subscribe(state => {

            const stored_state = { default_scale : state.default_scale, 
                chord_list : state.chord_list.map(v => {
                    if (v instanceof CustomChord) return { '.c.c.' : v }
                    else return { '.s.c.' : v }
                })}
            localStorage.setItem(store_key, JSON.stringify(stored_state));
        })

    }

    ngOnInit() {
        console.log("main-page-store oninit called")
    }

    // --------- SELECTORS -------------------------
    readonly default_scale$: Observable<Scale | null> = this.select(state => state.default_scale);

    readonly chord_list$: Observable<NamedNoteList[]> = this.select(state => state.chord_list);

    private readonly all_state$: Observable<MainPageState> = this.select(state => state);

    // -------- UPDATERS ----------------------------
    readonly change_scale = this.updater((state, scale : Scale ) => ({
        ...state,
        default_scale : scale,
      }));

    readonly replace_chord = this.updater<{chord : NamedNoteList, index : number}>((state, v ) => {
        const newList : NamedNoteList[] = [...state.chord_list];
        newList[v.index] = v.chord;
        return {
            ...state,
            chord_list : newList,
        }
    });
       
    readonly insert_chord = this.updater<{chord : NamedNoteList, index : number}>((state, v ) => {
        const newList : NamedNoteList[] = [...state.chord_list];
        newList.splice(v.index, 0, v.chord);
        return {
            ...state,
            chord_list : newList,
        }
    });

    readonly move_chord = this.updater<{before : number, after : number}>((state, v ) => {
        const newList : NamedNoteList[] = [...state.chord_list];
        const deleted = newList.splice(v.before, 1);
        newList.splice(v.after, 0, deleted[0]);
        return {
            ...state,
            chord_list : newList,
        }
    });

    readonly delete_chord = this.updater((state, index : number) => {
        const newList : NamedNoteList[] = [...state.chord_list];
        newList.splice(index, 1);
        return {
            ...state,
            chord_list : newList,
        }    
    });

    readonly append_chords = this.updater((state, newList : NamedNoteList[]) => ({
        ...state,
        chord_list : [...state.chord_list, ...newList],

    }));

    readonly replace_chord_list = this.updater((state, newList : NamedNoteList[]) => ({
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
