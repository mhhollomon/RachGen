import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmActionDialogComponent } from '../confirm-action-dialog/confirm-action-dialog.component';
import { defaultMidiConfig, MidiConfig } from "../models/MidiConfig";
import { PreferencesService } from '../services/preferences.service';

@Component({
  selector: 'app-preference-dialog',
  templateUrl: './preference-dialog.component.html',
  styleUrls: ['./preference-dialog.component.scss']
})
export class PreferenceDialogComponent {

  midi_config : MidiConfig = defaultMidiConfig();

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

  midi_config_change(event : MidiConfig) {
    this.midi_changed = true;
    this.midi_config = Object.assign({}, event);
  }

  clear_settings() {
    const dia = this.dialog.open(ConfirmActionDialogComponent, {data : "Clearing Saved Preferences"});

    dia.afterClosed().subscribe((data) => {
      if (data) {
        this.prefs.clear_settings();
      }
    })

  }

}
