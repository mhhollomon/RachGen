import { Note } from "./note";
import { List } from 'immutable';



export interface NamedNoteList {
  keep: boolean;
  name(): string;
  nameUnicode(): string;
  noteList(): List<Note>;
  isSame(nl: NamedNoteList): boolean;

}

export const octavePlacement: { [index: string]: number } = {
  'C': 0, 'D': 1, 'E': 2, 'F': 3, 'G': 4, 'A': 5, 'B': 6
}


export function voiceChord(notelist: NamedNoteList): string[] {
  const tones: string[] = [];
  let octave = 3;
  let last = -1;
  let isBassNote = true;

  for (const c of notelist.noteList()) {

    const simpleNote = c.toSharp();

    if (octavePlacement[simpleNote.noteClass] < last) {
      octave += 1;
    }
    tones.push(simpleNote.name() + octave);

    if (isBassNote) {
      octave += 1;
      isBassNote = false;
    } else {
      last = octavePlacement[simpleNote.noteClass];
    }

  }

  return tones;

}
