import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { defaultGeneratorOptionProps, GeneratorOptionProps } from "../generator-options/GeneratorOptions";

export interface NewListDialogData {
  gen_opts : GeneratorOptionProps,
  title : string
}

@Component({
  selector: 'app-new-list-dialog',
  templateUrl: './new-list-dialog.component.html',
  styleUrls: ['./new-list-dialog.component.scss']
})
export class NewListDialogComponent {

  public gen_opts : GeneratorOptionProps = defaultGeneratorOptionProps();

  public title = "Generate Chords"

  constructor(@Inject(MAT_DIALOG_DATA) public data : Partial<NewListDialogComponent>) {

    if (data.gen_opts) {
      this.gen_opts = data.gen_opts;
    }

    if (data.title) {
      this.title = data.title;
    }


  }
  
}
