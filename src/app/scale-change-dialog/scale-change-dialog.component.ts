import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScaleService } from '../scale.service';
import { ScaleID, ScaleType } from '../utils/music-theory/scale';

@Component({
  selector: 'app-scale-change-dialog',
  templateUrl: './scale-change-dialog.component.html',
  styleUrls: ['./scale-change-dialog.component.scss']
})
export class ScaleChangeDialogComponent {

  set center(c : string) {
    this.scaleID = { key_center : c, type : this.scaleID.type };
  }

  get center() { return this.scaleID.key_center; }

  set scale_type(t : ScaleType) {
    this.scaleID = { key_center : this.scaleID.key_center, type : t };
  }

  get scale_type() : ScaleType { return this.scaleID.type; }

  constructor(
    private scaleService : ScaleService,
    @Inject(MAT_DIALOG_DATA) public scaleID : ScaleID) {  }



  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.scaleID.type as ScaleType);
  }

}
