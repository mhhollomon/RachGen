import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MidiConfig } from '../models/MidiConfig';


@Component({
  selector: 'app-midi-dialog',
  templateUrl: './midi-dialog.component.html',
  styleUrls: ['./midi-dialog.component.scss']
})
export class MidiDialogComponent {

  public localConfig : MidiConfig

  constructor(@Inject(MAT_DIALOG_DATA) public config : MidiConfig,
      ) {

        this.localConfig = { ...config};
  }


}
