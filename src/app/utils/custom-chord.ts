import { Chord } from "./music-theory/chord";
import { Note } from "./music-theory/note";

export class CustomChord extends Chord{
    nameCache  = 'Custom Chord';
    notes : Note[] = [];

    constructor(n? : Chord) {
        super();
        if (n) {
            super.copy(n);
            this.notes = n.invertedChordTones();
        }
    }

    override invertedChordTones(): Note[] {
        return this.notes;
    }

    override name(): string {
        return this.nameCache;
    }
    
    override clone(): CustomChord {
        const clone = new CustomChord();
        this.copy(clone);

        return clone;

    }

    override copy(o : CustomChord) {
        super.copy(o);
        o.nameCache = this.nameCache;
        o.notes = Object.assign([], this.notes);
    }

    addChordTone(n : string) {
        this.notes.push(new Note(n));
    }
}
