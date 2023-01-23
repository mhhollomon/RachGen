import { Component } from '@angular/core';

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

}
