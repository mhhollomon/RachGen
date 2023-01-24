
import {capitalize} from '../util-library';
import { Chord } from './chord';
import { Note } from "./note";

interface GenericNoteData {
    name : string,
    next : number,
    prev : number
}

  
function gnd(name: string, prev : number, next : number) : GenericNoteData {
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


const ScaleTypeEnum = {
    minor : 'minor',
    major : 'major',
    lydian : 'lydian',
    mixolydian : 'mixolydian',
    dorian : 'dorian',
    phrygian : 'phrygian',
    augmented : 'augmented'
}

export type ScaleType = keyof typeof ScaleTypeEnum;

export interface ScaleID {
    key_center : string;
    type : ScaleType;
}

export function CMajorID() : ScaleID {
    return { key_center : 'C', type : 'major'}
}

export function defaultScaleID() { return CMajorID(); }

export function isScaleID(object: any) : object is ScaleID {
    return 'key_center' in object;
}

export class Scale {
    rootNote : Note;
    scaleType : ScaleType;

    private notesCache : Note[] | null = null;
 

    constructor(id : ScaleID )
    constructor(rootNote : string | Note, scaleType : ScaleType )
    constructor(rootNote : string | Note | ScaleID, scaleType? : ScaleType ) {

        if (scaleType) {
            this.scaleType = scaleType;
            if (typeof rootNote == 'string') {
                this.rootNote = new Note(rootNote);
            } else if (rootNote instanceof Note) {
                this.rootNote = rootNote;
            } else {
                // This shouldn't happen if I understand the overload system
                this.rootNote = new Note(rootNote.key_center)
            }
        } else {
            if (isScaleID(rootNote)) {
                this.rootNote = new Note(rootNote.key_center);
                this.scaleType = rootNote.type;
            } else {
                throw Error("type Error");
            }
        }
    }

    root() {
        return this.rootNote.note();
    }

    rootDisplay() {
        return this.rootNote.noteDisplay();
    }

    isMinor() {
        return (this.scaleType === ScaleTypeEnum.minor );
    }

    fullName() {
        return this.root() + ' ' + capitalize(this.scaleType);
    }

    fullDisplay() {
        return this.rootDisplay() + ' ' + capitalize(this.scaleType);
    }

    id() { return this.fullName(); }

    scaleID() : ScaleID { return { key_center : this.root(), type : this.scaleType};}

    isSame(o : Scale | undefined | null) : boolean {
        return (o != undefined && this.rootNote.equal(o.rootNote) && this.scaleType === o.scaleType);
    }

    notesOfScale() : Note[] {

        if (this.notesCache)
            return this.notesCache;
        
        const notes :Note[] = [];
    
        const scaleSteps = scaleStepData[this.scaleType];
    
        const current_generic_note = this.rootNote.noteClass;
        let index = 0;
        while(genericNotes[index].name != current_generic_note) {
          index += 1;
        }
    
        notes.push(this.rootNote);
        
        let scaleDegree = 1;
        while (scaleDegree < 7) {
          index += 1;
          const stepSize = genericNotes[index].prev;
          const neededStepSize = scaleSteps[scaleDegree];
    
          let newAlter = notes[notes.length-1].alter;
    
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
    
          notes.push(new Note(genericNotes[index].name, newAlter));
          scaleDegree += 1;
        }

        this.notesCache = notes;
        
        return notes;
    
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
