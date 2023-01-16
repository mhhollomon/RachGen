import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AudioService } from '../audio.service';
import { PreferencesService } from '../services/preferences.service';
import { Chord } from '../utils/music-theory/chord';

const audition_pref_name = 'edit_audition'

@Component({
  selector: 'app-chord-edit-dialog',
  templateUrl: './chord-edit-dialog.component.html',
  styleUrls: ['./chord-edit-dialog.component.scss']
})
export class ChordEditDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public chord : Chord,
    private audioService : AudioService,
    private preferences : PreferencesService
      ) {

        this.auditionCache = this.preferences.read(audition_pref_name, true);
  }

  auditionCache : boolean;

  get audition() { return this.auditionCache; }
  set audition(v : boolean) {
    this.auditionCache =v;
    this.preferences.write(audition_pref_name, v);
  }

  get seventh() { return this.chord.extensions['7th']; }
  set seventh(v : boolean) { this.chord.setExtension('7th', v)}

  get ninth() { return this.chord.extensions['9th']; }
  set ninth(v : boolean) { this.chord.setExtension('9th', v)}

  get eleventh() { return this.chord.extensions['11th']; }
  set eleventh(v : boolean) { this.chord.setExtension('11th', v)}

  async audition_chord() {
    // the click handler is called before any data updates
    // have happened. So, use setTimeout in order to allow
    // the event loop to "catch-up".
    //
    if (this.audition)
      setTimeout(() => { this.play_chord()}, 10);
  }

  async play_chord() {

    const tones = this.chord.voiceChord();
  
    this.audioService.play_chord(tones, 0.5);

  }

}
