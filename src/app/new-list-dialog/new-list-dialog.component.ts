import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GeneratorOptions } from '../generator-options/generator-options.component';

@Component({
  selector: 'app-new-list-dialog',
  templateUrl: './new-list-dialog.component.html',
  styleUrls: ['./new-list-dialog.component.scss']
})
export class NewListDialogComponent {


  constructor(@Inject(MAT_DIALOG_DATA) public gen_opts : GeneratorOptions) {
  }
  
}
