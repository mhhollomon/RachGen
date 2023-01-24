import { TestBed } from '@angular/core/testing';
import { Note } from './utils/music-theory/note';
import { Scale } from './utils/music-theory/scale';

import { ScaleService } from './scale.service';


describe('ScaleService', () => {
  let service: ScaleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScaleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});
