import { Component, Input, OnInit } from '@angular/core';
import { Scale } from '../utils/music-theory/scale';

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

  private _scale = new Scale();

  table_data : scale_note_info[] = [];
  displayedColumns: string[] = ['degree', 'note', 'triad', 'roman'];

  ngOnInit() {
    this.refresh_data_source();
  }

  @Input() set scale(s : Scale) {
    this._scale = s;

    this.refresh_data_source();

  }

  refresh_data_source() {

    this.table_data= [];

    this._scale.notesOfScale().forEach((n, i) => { 
      const degree = i+1;
      this.table_data.push({
        degree : degree,
        note : n.nameUnicode(),
        triad : this._scale.chordForDegree(degree).nameUnicode(),
        roman : this._scale.romanForDegree(degree),
    })})

  }


  get scaleNotes() { return this.scale.notesOfScale(); }

}
