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

  constructor(
    private scaleService : ScaleService,
    @Inject(MAT_DIALOG_DATA) public scaleID : ScaleID) {
      this.scaleID = scaleID;
    if (scaleID == undefined) {
      this.scaleID = { key_center : 'C', type : 'major' };
    }
  }

  getKeyList() : string[] {
    return this.scaleService.getKeyList(this.scaleID.type as ScaleType);
  }

}
