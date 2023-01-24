
import { List, type ValueObject } from 'immutable';
import { stringHash } from '../util-library';

import { capitalize } from '../util-library';
import { Chord } from './chord';
import { GenericNoteClass, Note } from "./note";

interface GenericNoteData {
    name : GenericNoteClass,
    next : number,
    prev : number
}

  
function gnd(name: GenericNoteClass, prev : number, next : number) : GenericNoteData {
    return {'name' : name, 'next' : next, 'prev' : prev };
}
  
const genericNotes : GenericNoteData[] = [
    gnd('A', 2, 2), gnd('B', 2, 1), gnd('C', 1, 2), gnd('D', 2, 2), gnd('E', 2, 1), gnd('F', 1, 2), gnd('G', 2, 2),
    gnd('A', 2, 2), gnd('B', 2, 1), gnd('C', 1, 2), gnd('D', 2, 2), gnd('E', 2, 1), gnd('F', 1, 2), gnd('G', 2, 2),
]

  

/* number of semi-tones between notes */
const scaleStepData = {
    major :     [0, 2, 2, 1, 2, 2, 2 ],
    lydian :    [0, 2, 2, 2, 1, 2, 2 ],
    mixolydian: [0, 2, 2, 1, 2, 2, 1 ],
    dorian :    [0, 2, 1, 2, 2, 2, 1 ],
    minor :     [0, 2, 1, 2, 2, 1, 2 ],
    phrygian :  [0, 1, 2, 2, 1, 2, 2 ],
    augmented : [0, 2, 2, 2, 2, 1, 2 ],
  } as const;


export type ScaleType = 'minor' | 'major' | 
        'lydian' | 'mixolydian' |
        'dorian' | 'phrygian' ;

export interface ScaleID {
    root : string;
    type : ScaleType;
}

export function defaultScaleID() : ScaleID  { return { root : 'C', type : 'major'}; }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isScaleID(obj: any) : obj is ScaleID {
    return 'root' in obj;
}

export class Scale implements ValueObject {
    private _root : Note;
    private _type : ScaleType;

    get root() { return this._root; }
    get type() { return this._type; }

    private _notesCache : List<Note> = List<Note>([]);
 

    constructor(id : ScaleID )
    constructor(rootNote : string | Note, scaleType : ScaleType )
    constructor(rootNote : string | Note | ScaleID, scaleType? : ScaleType ) {

        if (scaleType != undefined ) {
            this._type = scaleType;
            if (typeof rootNote == 'string') {
                this._root = Note.fromString(rootNote);
            } else if (rootNote instanceof Note) {
                this._root = rootNote;
            } else {
                // This shouldn't happen if I understand the overload system
                this._root = Note.fromString(rootNote.root)
            }
        } else if (isScaleID(rootNote)) {
            this._root = Note.fromString(rootNote.root);
            this._type = rootNote.type;
        } else {
            throw Error("type Error");
        }
    }

    rootName() {
        return this.root.name();
    }

    rootNameUnicode() {
        return this.root.nameUnicode();
    }

    name() {
        return this.rootName() + ' ' + capitalize(this.type);
    }

    nameUnicode() {
        return this.rootNameUnicode() + ' ' + capitalize(this.type);
    }

    id() { return this.name(); }

    scaleID() : ScaleID { return { root : this.rootName(), type : this.type}; }

    equals(o: Scale) { return this.isSame(o); }

    hashCode() :number { return stringHash(this.name()); }

    isSame(o : Scale | undefined | null) : boolean {
        return (o != undefined && this.root.equals(o.root) && this.type === o.type);
    }

    notesOfScale() : List<Note> {

        if (this._notesCache.size > 1)
            return this._notesCache;
            
        const scaleSteps = scaleStepData[this.type];
    
        const current_generic_note = this.root.noteClass;
        let index = 0;
        while(genericNotes[index].name != current_generic_note) {
          index += 1;
        }
    
        this._notesCache = this._notesCache.push(this.root);
        
        let scaleDegree = 1;
        while (scaleDegree < 7) {
          index += 1;

          const gnd = genericNotes[index];
          const stepSize = gnd.prev;
          const neededStepSize = scaleSteps[scaleDegree];
    
          let newAlter = this._notesCache.get(-1, this.root).alter;
    
          if (stepSize == neededStepSize) {
            // We want this note, but it needs to be altered the same
            // way that our current note is altered (to preserve the step size)
    
            // So, do nothing.
          } else if (stepSize < neededStepSize) {
            // Need to alter this new note up one from the last;
            newAlter += 1;
          } else { // stepSize > neededStepSize
            // Need to alter this new note down one from the last;
            newAlter -= 1;
          }
    
          this._notesCache = this._notesCache.push(new Note(gnd.name, newAlter));
          scaleDegree += 1;
        }

        
        return this._notesCache;
    
    }

    chordForDegree(degree : number) : Chord {
        const retval = new Chord();

        retval.setScale(this).setRootFromDegree(degree)
            .setInversion('root')
            .setChordType('triad');


        return retval;
    }

    romanForDegree(degree : number) : string {
        degree = Math.floor(degree);

        let retval = '';

        switch(degree) {
            case 1 : retval = 'I'; break;
            case 2 : retval = 'II'; break;
            case 3 : retval = 'III'; break;
            case 4 : retval = 'IV'; break;
            case 5 : retval = 'V'; break;
            case 6 : retval = 'VI'; break;
            case 7 : retval = 'VII'; break;
            default : throw Error("bad degree in romanForDegee");
        }

        const chord = this.chordForDegree(degree);
        if (chord.isMin()) {
            retval = retval.toLowerCase();
        } else if (chord.isDim()) {
            retval = retval.toLowerCase() + "\u00b0";
        }


        return retval;
    }

}
