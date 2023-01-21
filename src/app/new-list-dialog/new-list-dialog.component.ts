import { Component } from '@angular/core';
import { defaultGeneratorOptions, GeneratorOptions } from '../generator-options/generator-options.component';
import { PreferencesService } from '../services/preferences.service';

@Component({
  selector: 'app-new-list-dialog',
  templateUrl: './new-list-dialog.component.html',
  styleUrls: ['./new-list-dialog.component.scss']
})
export class NewListDialogComponent {

  gen_opts : GeneratorOptions;

  constructor(private prefs : PreferencesService) {
    this.gen_opts = prefs.read('gen_opts_data', defaultGeneratorOptions());
  }
  
}
