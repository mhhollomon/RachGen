import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScaleService } from '../scale.service';
import {  Scale, ScaleType } from '../utils/music-theory/scale';

export interface ScaleChangeConfig {
  scale : Scale;
  allow_change : boolean;

}

export function defaultScaleChangeConfig() : ScaleChangeConfig {
  return { 
    scale : new Scale(), 
    allow_change : true 
  };
}

@Component({
  selector: 'app-scale-change-dialog',
  templateUrl: './scale-change-dialog.component.html',
  styleUrls: ['./scale-change-dialog.component.scss']
})
export class ScaleChangeDialogComponent {

  config : ScaleChangeConfig = defaultScaleChangeConfig();

  set center(c : string) {
    this.config.scale = this.config.scale.setCenter(c);
  }

  get center() { return this.config.scale.center; }

  set scale_type(t : ScaleType) {
    this.config.scale  = this.config.scale.setType(t);
  }

  get scale_type() : ScaleType { return this.config.scale.type; }

  get allow_change() : boolean { return this.config.allow_change; }

  get dialog_title() : string {
    if (this.allow_change) {
      return 'Change Default Scale'
    } else {
      return this.config.scale.nameUnicode() + ' Information';
    }
  }

  constructor(
    private scaleService : ScaleService,
    @Inject(MAT_DIALOG_DATA) private _input_config : ScaleChangeConfig) { 

      if (_input_config != undefined) {
        this.config = Object.assign({}, _input_config);
      }

  }

  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.config.scale.type as ScaleType);
  }

}
