
import { List, Record } from 'immutable';

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


export const ScaleRecord = Record({center : 'C', type : <ScaleType>('major')}
);

export const defaultScaleRecord = ScaleRecord();

export type ScaleRecordType = typeof defaultScaleRecord;


export class Scale extends ScaleRecord {
    private _root : Note;

    get root() { return this._root; }

    private _notesCache : List<Note> = List<Note>([]);
 
    constructor(props? : object) {
        super(props == undefined ? {} : props);

        this._root = Note.fromString(this.center);
    }

    setCenter(newCenter : string) : Scale {
        return new Scale({center : newCenter, type : this.type });
    }

    setType(newType : ScaleType) : Scale {
        return new Scale({center : this.center, type : newType });
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
