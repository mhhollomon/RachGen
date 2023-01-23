import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface MidiConfig {
  includeScale : boolean,
  separateBass : boolean,
  includeMarkers : boolean,
  fileName : string,
}

export function defaultMidiConfig() : MidiConfig {
  return {
    separateBass : false,
    includeScale : true,
    includeMarkers : false,
    fileName : "random-chords",
  }
}

@Component({
  selector: 'app-midi-dialog',
  templateUrl: './midi-dialog.component.html',
  styleUrls: ['./midi-dialog.component.scss']
})
export class MidiDialogComponent {

  public localConfig : MidiConfig

  constructor(@Inject(MAT_DIALOG_DATA) public config : MidiConfig,
      ) {

        this.localConfig = Object.assign({}, config);
  }


}
