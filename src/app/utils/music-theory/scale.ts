
import {capitalize} from '../util-library';
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

export class Scale {
    rootNote : Note;
    scaleType : ScaleType;

    private notesCache : Note[] | null = null;
 

    constructor(rootNote : string | Note, scaleType : ScaleType ) {

        this.scaleType = scaleType;
        this.rootNote = (typeof rootNote == 'string') ? new Note(rootNote) : rootNote;

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

}
