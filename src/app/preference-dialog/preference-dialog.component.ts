import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ClearSettingsDialogComponent } from '../clear-settings-dialog/clear-settings-dialog.component';
import { MidiConfig } from '../midi-dialog/midi-dialog.component';
import { PreferencesService } from '../services/preferences.service';

@Component({
  selector: 'app-preference-dialog',
  templateUrl: './preference-dialog.component.html',
  styleUrls: ['./preference-dialog.component.scss']
})
export class PreferenceDialogComponent {

  midi_config : MidiConfig = {
    separateBass : false, 
    includeMarkers : false,  
    includeScale : true 
  };

  midi_changed = false;

  constructor(
    public dialog: MatDialog, 
    private prefs : PreferencesService,
    ) {
    const midi = prefs.read('midi', null);
    if (midi) {
      Object.assign(this.midi_config, midi);
    }
  }

  do_it() {
    if (this.midi_changed) {
      this.prefs.write('midi', this.midi_config);     
    }
  }

  midi_change() {
    this.midi_changed = true;
  }

  clear_settings() {
    const dia = this.dialog.open(ClearSettingsDialogComponent);

    dia.afterClosed().subscribe((data) => {
      if (data) {
        this.prefs.clear_settings();
      }
    })

  }

}
