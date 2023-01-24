export type GenericNoteClass = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';


interface NoteGraphData {
    name : string;
    nextNote : GenericNoteClass;
    prevNote : GenericNoteClass;
    nextDist : number;
    prevDist : number;
}

const noteGraph : { [ index : string ] : NoteGraphData } = {
    'A' : { name : 'A', nextNote : 'B', prevNote : 'G', nextDist : 2, prevDist : -2},
    'B' : { name : 'B', nextNote : 'C', prevNote : 'A', nextDist : 1, prevDist : -2},
    'C' : { name : 'C', nextNote : 'D', prevNote : 'B', nextDist : 2, prevDist : -1},
    'D' : { name : 'D', nextNote : 'E', prevNote : 'C', nextDist : 2, prevDist : -2},
    'E' : { name : 'E', nextNote : 'F', prevNote : 'D', nextDist : 1, prevDist : -2},
    'F' : { name : 'F', nextNote : 'G', prevNote : 'E', nextDist : 2, prevDist : -1},
    'G' : { name : 'G', nextNote : 'A', prevNote : 'F', nextDist : 2, prevDist : -2},
}

const accidentalToAlter : { [ index : string ] : number } = {
    'b' : -1,
    '#' : +1,
    'x' : +2,
    'bb' : -2,
}


export class Note {
    private _noteClass : GenericNoteClass = 'A';
    private _alter  = 0;

    get noteClass() : GenericNoteClass { return this._noteClass; }
    get alter() : number { return this._alter; }
    get accidental() : string {
        return ['bb', 'b', '', '#', 'x'][this.alter+2];
    }
    get accidentalUnicode() : string {
       return  ['\uD834\uDD2B', '\u266D', '', '\u266F', '\uD834\uDD2A'][this.alter+2];
    }

    constructor(note: GenericNoteClass, alter  = 0 ) {

        if (![-2, -1, 0, 1, 2].includes(alter)) {
            throw Error("Invalid alter amount : " + alter);
        }

        this._alter = alter;
        this._noteClass = note;

    }

    name() {
        return this.noteClass + this.accidental;
    }

    nameDisplay() {
        return this.noteClass + this.accidentalUnicode;
    }

    flatten(steps  = 1) : Note {
        if (steps <= 0) {
            throw new Error("steps to flatten must be >= 1")
        }

        const newAlter = this.alter - steps;
        if (newAlter < -2) {
            throw new Error("too much flattening")
        }

        return new Note(this._noteClass, newAlter);

    }

    sharpen(steps  = 1) : Note {
        if (steps <= 0) {
            throw new Error("steps to sharpen must be >= 1")
        }

        const newAlter = this.alter + steps;
        if (newAlter > 2) {
            throw new Error("too much sharpening")
        }

        return new Note(this.noteClass, newAlter);

    }

    simplify() : Note {
        if (this.alter === 0) {
            // Nothing to simplify. Return a copy of ourself
            return this.clone();
        } 

        const gnd = noteGraph[this.noteClass];

        if (this.alter < 0) {
            if (gnd.prevDist >= this.alter )
                return new Note(gnd.prevNote, this.alter - gnd.prevDist);
            else 
                return this.clone();
            
        } else {
            if (gnd.nextDist <= this.alter )
                return new Note(gnd.nextNote, this.alter - gnd.nextDist);
            else 
                return this.clone();
        }
    }

    toSharp() : Note {
        const note = this.simplify();

        let n = note.noteClass;
        let a = note.alter;

        while (a < 0) {
            const gnd = noteGraph[n];
            a -= gnd.prevDist;
            n = gnd.prevNote;
        }

        return new Note(n, a);
    }

    equal(o : Note) : boolean {
        return this.noteClass === o.noteClass && 
                this.alter === o.alter;
    }

    same(o : Note) : boolean {
        return this.toSharp().equal(o.toSharp());
    }

    clone() : Note {
        return new Note(this.noteClass, this.alter);
    }

    interval(o : Note) {
        const me = this.toSharp();
        const they = o.toSharp();

        let interval = they.alter - me.alter;
        let noteClass = me.noteClass;

        while (noteClass !== they.noteClass) {
            interval += noteGraph[noteClass].nextDist;
            noteClass = noteGraph[noteClass].nextNote;
        }

        if (interval < 0) {
            interval += 12;
        }

        return interval;
    }


    static fromString(input : string) {

        const noteName = input.substring(0,1).toUpperCase();

        if (! ['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(noteName)) {
            throw Error("Bad generic note :" + noteName);
        }

        const noteClass = noteName as GenericNoteClass;
        let computedAlter = 0;

        if (input.length > 1) {
            const accidental = input.substring(1);

            computedAlter = accidentalToAlter[accidental];

            if (!computedAlter) {
                throw Error("Unknown accidental : " + accidental);
            }
        }

        return new Note(noteClass, computedAlter);

    }
}
