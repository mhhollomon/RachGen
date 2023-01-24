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


  note_change(index : number , event : MatButtonToggleChange) {
    this.chord.notes[index] = new Note(event.value);
  }

  add_a_tone() {
    this.chord.addChordTone("C");
  }

  chromatic_list() { return [ 'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'] ;}
}
