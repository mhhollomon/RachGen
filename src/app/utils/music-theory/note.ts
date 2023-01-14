interface NoteGraphData {
    name : string;
    nextNote : string;
    prevNote : string;
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
    noteClass  = 'A';
    alter  = 0;

    constructor(note: string, alter? : number ) {

        if (alter) {
            if (![-2, -1, 0, 1, 2].includes(alter)) {
                throw Error("Invalid alter amount : " + alter);
            }
            this.alter = alter;
        }

        if (note.length > 1) {
            if (alter) {
                throw Error("Cannot use alter with accidental");
            }
            this.test_and_set_note(note.substring(0, 1));
            const accidental = note.substring(1);

            const computedAlter = accidentalToAlter[accidental];

            if (computedAlter) {
                this.alter = computedAlter;
            } else {
                throw Error("Unknown accidental : " + accidental);
            }
        } else if (note.length == 1) {
            this.test_and_set_note(note);
        } else {
            throw Error("Invalid key specifier : " + note );
        }
    }

    note() {
        return this.noteClass + ['bb', 'b', '', '#', 'x'][this.alter+2];
    }

    noteDisplay() {
        return this.noteClass + ['\uD834\uDD2B', '\u266D', '', '\u266F', '\uD834\uDD2A'][this.alter+2];
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

        while (note.alter < 0) {
            const gnd = noteGraph[note.noteClass];
            note.alter -= gnd.prevDist;
            note.noteClass = gnd.prevNote;
        }

        return note;
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

    


    private test_and_set_note(note : string) {
        note = note.toUpperCase();

        if (['A', 'B', 'C', 'D', 'E', 'F', 'G'].includes(note)) {
            this.noteClass = note;
        } else {
            throw Error("Bad generic note :" + note);
        }
    }
}
