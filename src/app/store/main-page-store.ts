import { ForwardRefHandling } from "@angular/compiler";
import { Injectable } from "@angular/core";
import { ComponentStore } from "@ngrx/component-store";
import { Observable } from "rxjs";
import { defaultMidiConfig, MidiConfig } from "../models/MidiConfig";
import { CustomChord } from "../utils/custom-chord";

import { Chord } from "../utils/music-theory/chord";
import { NamedNoteList } from "../utils/music-theory/NamedNoteList";
import { Note } from "../utils/music-theory/note";
import { Scale } from "../utils/music-theory/scale";


export interface MainPageState {
    default_scale : Scale | null;
    midi : MidiConfig;
    chord_list : NamedNoteList[];
}

function defaultState() : MainPageState {
    return { 
        default_scale : null, 
        midi : defaultMidiConfig(),
        chord_list : [] 
    };
}
const store_key = 'rg.MainPageStore';

const thawers : Map<string, (x : Array<any>) => unknown> = new Map<string, (x : Array<any>) => unknown>(
    [
        [ Scale.classTag, Scale.thaw ],
        [ Chord.classTag, Chord.thaw ],
        [ CustomChord.classTag, CustomChord.thaw ],
        [ Note.classTag, Note.thaw ],
    ]);

@Injectable()
export class MainPageStore extends ComponentStore<MainPageState> {

    // for now
    constructor() {

        super();

        let props = defaultState();
        const jsblob = localStorage.getItem(store_key);

        if (jsblob != null) {
            props = this.thaw(props, jsblob);
        }
        super.setState(props);


        // update local storage on any changes
        this.all_state$.subscribe(state => {
            localStorage.setItem(store_key, JSON.stringify(state));
        });

    }

    //============== SELECTORS ===============================
    //========================================================
    readonly default_scale$: Observable<Scale | null> = this.select(state => state.default_scale);

    readonly chord_list$: Observable<NamedNoteList[]> = this.select(state => state.chord_list);

    readonly midi_config$ : Observable<MidiConfig> = this.select(state => state.midi);

    private readonly all_state$: Observable<MainPageState> = this.select(state => state);

    //============== UPDATERS ================================
    //========================================================

    //-------------- CLEAR ALL -----------------------------
    readonly clear_settings = this.updater((state) => {
        localStorage.removeItem(store_key);
        return defaultState();
    })

    //-------------- DEFAULT_SCALE -----------------------------
    readonly change_scale = this.updater((state, scale : Scale ) => ({
        ...state,
        default_scale : scale,
    }));

    //------------- MIDI --------------------------------------
    readonly update_midi_config = this.updater((state, midi : MidiConfig) => ({
        ...state,
        midi : midi,
    }));

    //------------- CHORD_LIST ---------------------------------
    readonly replace_chord_list = this.updater((state, newList : NamedNoteList[]) => ({
        ...state,
        chord_list : [...newList],

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


    readonly unlock_all_chords = this.updater((state) => ({
        ...state,
        chord_list : state.chord_list.map(c => { c.keep = !c.keep; return c}),

    }));


    readonly delete_unlocked_chords = this.updater((state) => ({
        ...state,
        chord_list : state.chord_list.filter(c => c.keep),

    }));

    // ------------------ Reading Prefs -----------------------------------

    private thaw(defaults : MainPageState, data : any) : MainPageState {

        const newProps = { ...defaults };

        try {
            const blob_obj = JSON.parse(data, (key, v) => {
                if (Array.isArray(v) && v.length > 0 && (typeof v[0] === 'string')) {

                    const fn = thawers.get(v[0]);
                    if (fn) {
                        return fn(v);
                    }
                }
                return v;
            });

            // -- copy the read info into our output.
            for (const k in blob_obj) {
                if (Object.hasOwn(newProps, k)) {
                    (newProps as any)[k] = blob_obj[k];
                }
            }
    
        } catch (e) {
            console.log(e);
            return defaults; // ignore anything in newProps.
        }

        return newProps;

    }
}
