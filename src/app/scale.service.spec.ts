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

  it("correctly caches scale notes", () => {
    const scale = new Scale("G", 'major');

    const retval = [ 'G', 'A', 'B', 'C', 'D', 'E', 'F#'].map(v => Note.fromString(v));

    const theSpy = spyOn(scale, 'notesOfScale').and.callThrough();

    expect(service.getScaleNotes(scale)).withContext("first time").toEqual(retval);
    expect(theSpy).withContext("first time").toHaveBeenCalled();
    theSpy.calls.reset();

    expect(service.getScaleNotes(scale)).withContext("second time").toEqual(retval);
    expect(theSpy).withContext("second time").not.toHaveBeenCalled();

  });

});
