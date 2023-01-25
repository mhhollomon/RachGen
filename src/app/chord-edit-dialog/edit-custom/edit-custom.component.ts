import { Component, Input } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { CustomChord } from 'src/app/utils/custom-chord';
import { Note } from 'src/app/utils/music-theory/note';

@Component({
  selector: 'app-edit-custom',
  templateUrl: './edit-custom.component.html',
  styleUrls: ['./edit-custom.component.scss']
})
export class EditCustomComponent {

  @Input() chord : CustomChord = new CustomChord();

  get name() { return this.chord.nameUnicode(); }
  
  set name(name : string ) {
    this.chord = this.chord.setName(name);
  }

  note_change(index : number , event : MatButtonToggleChange) {
    //this.chord = this.chord.setIn(['noteList', index], new Note(event.value) )

    this.chord = this.chord.setNotes(this.chord.noteList().set(index, new Note(event.value)));
  }

  add_a_tone() {
    this.chord = this.chord.addChordTone("C");
  }

  chromatic_list() { return [ 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] ;}
}
