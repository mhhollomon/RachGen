import { NamedNoteList, Chord } from "./music-theory/chord";
import { Note } from "./music-theory/note";
import { List } from "immutable";

export class CustomChord implements NamedNoteList {
    private _name  : string;
    private _notes : List<Note> = List<Note>([]);

    constructor(n : Chord | List<Note> = List<Note>([]), name? : string) {
        if (name != undefined ) {
            this._name = name;
        } else {
            this._name = 'Custom Chord';
        }

        if (n instanceof Chord ) {
            this._notes = n.noteList();
        } else {
            this._notes = n;
        }
    }

    setName(name : string) : CustomChord {
        return new CustomChord(this._notes, name);
    }

    setNotes(list : List<Note>) : CustomChord {
        return new CustomChord(list, this._name);
    }
    
    addChordTone(n : string) : CustomChord {
        return new CustomChord(this._notes.push(Note.fromString(n)), this._name);
    }


    // ---- NamedNoteList interface -------

    noteList(): List<Note> {
        return this._notes;
    }

    name(): string {
        return this._name;
    }

    nameUnicode() : string { return this.name(); }

}
