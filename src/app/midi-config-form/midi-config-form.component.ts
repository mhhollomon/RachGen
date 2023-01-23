import { Component, EventEmitter, Input, Output } from '@angular/core';
import { defaultMidiConfig, MidiConfig } from '../midi-dialog/midi-dialog.component';

@Component({
  selector: 'app-midi-config-form',
  templateUrl: './midi-config-form.component.html',
  styleUrls: ['./midi-config-form.component.scss']
})
export class MidiConfigFormComponent {

  private _model : MidiConfig = defaultMidiConfig();

  @Output() midiConfigChange : EventEmitter<MidiConfig> = new EventEmitter();
  @Input() set midiConfig(mc : MidiConfig) {
    this._model = Object.assign({}, mc);
  }

  get ngModel() { return this._model};

  get includeScale() { return this._model.includeScale; }
  set includeScale(b : boolean ) {
    this._model.includeScale = b;
    this.midiConfigChange.emit(this._model);
  }

  get separateBass() { return this._model.separateBass; }
  set separateBass(b : boolean ) {
    this._model.separateBass = b;
    this.midiConfigChange.emit(this._model);
  }

  get includeMarkers() { return this._model.includeMarkers; }
  set includeMarkers(b : boolean ) {
    this._model.includeMarkers = b;
    this.midiConfigChange.emit(this._model);
  }

  get fileName() { return this._model.fileName; }
  set fileName(s : string ) {
    this._model.fileName = s;
    this.midiConfigChange.emit(this._model);
  }


}
