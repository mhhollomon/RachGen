import { Component, Input, OnInit } from '@angular/core';
import { CMajorID, Scale, ScaleID } from '../utils/music-theory/scale';

interface scale_note_info {
  degree  : number;
  note : string;
  triad : string;
  roman : string;
}

@Component({
  selector: 'app-scale-info',
  templateUrl: './scale-info.component.html',
  styleUrls: ['./scale-info.component.scss']
})
export class ScaleInfoComponent implements OnInit {

  private _scaleID = CMajorID();
  private _scale = new Scale(this._scaleID);

  table_data : scale_note_info[] = [];
  displayedColumns: string[] = ['degree', 'note', 'triad', 'roman'];

  ngOnInit() {
    this.refresh_data_source();
  }

  @Input() set scaleID(sid : ScaleID) {
    this._scaleID = sid;
    this._scale = new Scale(sid);

    this.refresh_data_source();

  }

  get scaleID() { return this._scaleID; }

  refresh_data_source() {

    this.table_data = this._scale.notesOfScale().map((n, i) => {
      const degree = i+1;
      return {
        degree : degree,
        note : n.nameDisplay(),
        triad : this._scale.chordForDegree(degree).computeNameDisplay(),
        roman : this._scale.romanForDegree(degree),
      };
    });

  }


  get scaleNotes() { return new Scale(this.scaleID).notesOfScale(); }

}
