import { Component, Inject } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { AudioService } from '../audio.service';
import { PreferencesService } from '../services/preferences.service';
import { CustomChord } from '../utils/custom-chord';
import { Chord, ChordType, InversionType } from '../utils/music-theory/chord';
import { NamedNoteList, voiceChord } from "../utils/music-theory/NamedNoteList";
import { audition_pref } from '../services/pref-keys';

@Component({
  selector: 'app-chord-edit-dialog',
  templateUrl: './chord-edit-dialog.component.html',
  styleUrls: ['./chord-edit-dialog.component.scss']
})
export class ChordEditDialogComponent {

  startTab : number;

  chord : Chord = new Chord();
  customChord : CustomChord = new CustomChord();

  private _audition : boolean;

  private _customNotValid = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public input_chord : NamedNoteList,
    private audioService : AudioService,
    private preferences : PreferencesService
      ) {

    if (this.input_chord instanceof CustomChord) {
      console.log("This is a custom chord");
      this.customChord = (this.input_chord as CustomChord);
      this._customNotValid = false;
      this.startTab = 1;
      this.chord = new Chord();
    } else {
      console.log("This is a standard chord");
      this.startTab = 0;
      this.chord = (this.input_chord as Chord);
    }

    this._audition = this.preferences.read(audition_pref, true);

  }


  get audition() { return this._audition; }
  set audition(v : boolean) {
    this._audition =v;
    this.preferences.write(audition_pref, v);
  }

  get inversion() { return this.chord.inversion; }
  set inversion(inv : InversionType) {this.chord = this.chord.setInversion(inv)}

  get chordType() { return this.chord.chordType; }
  set chordType(ct : ChordType) {this.chord = this.chord.setChordType(ct)}

  get seventh() { return this.chord.extensions['7th']; }
  set seventh(v : boolean) { this.chord = this.chord.setExtension('7th', v)}

  get ninth() { return this.chord.extensions['9th']; }
  set ninth(v : boolean) {this.chord =  this.chord.setExtension('9th', v)}

  get eleventh() { return this.chord.extensions['11th']; }
  set eleventh(v : boolean) { this.chord = this.chord.setExtension('11th', v)}

  root_note_change(event : MatButtonToggleChange) {
    const rootDegree = this.chord.scale.notesOfScale().map((v)=> v.name()).indexOf(event.value);
    this.chord = this.chord.setDegree(rootDegree+1);
    this.audition_chord();
  }

  current_root_note() : string {
    return this.chord.getRootName();
  }

  chord_isDim() : boolean { return this.chord.isDim(); }

  change_tabs(event : MatTabChangeEvent) {
    if (event.index === 1 && this._customNotValid) {
      this.customChord = new CustomChord(this.chord); 
      this._customNotValid = false;     

    }

  }

  async audition_chord(event? : Event ) {
    // the click handler is called before any data updates
    // have happened. So, use setTimeout in order to allow
    // the event loop to "catch-up".
    //

    if (event) {
      const pe = event as PointerEvent;
      console.log(pe);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (['Sus2', 'Sus4'].includes((pe.target as any)['innerText']) && this.chord.isDim()) {
        return;
      }
    }

    if (this.audition)
      setTimeout(() => { this.play_chord()}, 10);
  }



  async play_chord() {

    const tones = voiceChord(this.chord);
  
    this.audioService.play_chord(tones, 0.5);

  }

}
