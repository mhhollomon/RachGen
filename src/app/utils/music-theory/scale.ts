
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

export const ALL_SCALE_TYPES = ['major', 'minor', 'mixolydian', 'dorian', 'lydian', 'phrygian' ] as const;
type ScaleTypeTuple = typeof ALL_SCALE_TYPES; 
export type ScaleType = ScaleTypeTuple[number];

export const ScaleRecord = Record({center : 'C', type : <ScaleType>('major')}
);

export class Scale extends ScaleRecord {
    private _root : Note;

    get root() { return this._root; }

    private _notesCache : List<Note> = List<Note>([]);
 
    constructor(props? : string | object, type? : ScaleType) {
        let newProps = {};
        if (props != undefined ) {
            if (typeof props === 'string') {
                newProps = { center : props, type : type };
            } else {
                newProps = props;
            }
        }
        super(newProps);

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

    isSame(o : Scale | undefined | null) : boolean {
        return (o != undefined && this.root.equals(o.root) && this.type === o.type);
    }

    private fill_note_cache() {
        if (this._notesCache.size > 1)
            return;

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
    
    }

    notesOfScale() : List<Note> {
        this.fill_note_cache();        
        return this._notesCache;
    }

    get_note(degree : number) : Note {

        if (degree <= 0) {
            throw Error(`Degree out of bound : ${degree}`)
        }

        this.fill_note_cache();

        const index = (degree-1) % 7;
        
        const note = this._notesCache.get(index);

        if (note == undefined) {
            throw Error(`Note undefined for degree ${degree}`)
        }

        return note;

    }

    chordForDegree(degree : number) : Chord {
        const retval = new Chord(this, degree, 'triad', 'root');

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
            default : throw Error(`bad degree ${degree} in romanForDegee`);
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
