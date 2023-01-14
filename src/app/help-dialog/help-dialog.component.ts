import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface help_data {
  help_text : string,
  page_name : string,
}

@Component({
  selector: 'app-help-dialog',
  templateUrl: './help-dialog.component.html',
  styleUrls: ['./help-dialog.component.scss']
})
export class HelpDialogComponent  {

  constructor(@Inject(MAT_DIALOG_DATA) public data: help_data) {
  }


}
