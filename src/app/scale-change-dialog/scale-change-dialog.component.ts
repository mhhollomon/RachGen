import { Component, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScaleService } from '../scale.service';
import { defaultScaleID, Scale, ScaleID, ScaleType } from '../utils/music-theory/scale';

export interface ScaleChangeConfig {
  scaleID : ScaleID;
  allow_change : boolean;

}

export function defaultScaleChangeConfig() : ScaleChangeConfig {
  return { 
    scaleID : defaultScaleID(), 
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
    this.config.scaleID = { key_center : c, type : this.config.scaleID.type };
  }

  get center() { return this.config.scaleID.key_center; }

  set scale_type(t : ScaleType) {
    this.config.scaleID = { key_center : this.config.scaleID.key_center, type : t };
  }

  get scale_type() : ScaleType { return this.config.scaleID.type; }

  get allow_change() : boolean { return this.config.allow_change; }

  get scaleID() : ScaleID { return this.config.scaleID; }

  get dialog_title() : string {
    if (this.allow_change) {
      return 'Change Default Scale'
    } else {
      const s = new Scale(this.config.scaleID);
      return s.fullDisplay() + ' Information';
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
    return this.scaleService.getKeyList(this.config.scaleID.type as ScaleType);
  }

}
