import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


export interface MidiConfig {
  includeScale : boolean,
  separateBass : boolean,
  includeMarkers : boolean,
}

@Component({
  selector: 'app-midi-dialog',
  templateUrl: './midi-dialog.component.html',
  styleUrls: ['./midi-dialog.component.scss']
})
export class MidiDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public config : MidiConfig,
      public dialogRef: MatDialogRef<MidiDialogComponent>
      ) {
  }


}
