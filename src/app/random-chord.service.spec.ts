import { TestBed } from '@angular/core/testing';

import { Chord, Note } from './utils/music-theory/music-theory';
import { ChordSequenceBuilder, RandomChordService } from './random-chord.service';
import { ScaleService } from './scale.service';

describe('RandomChordService', () => {
  let service: RandomChordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RandomChordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

});


describe('ChordSequenceBuilder', () => {

  let builder : ChordSequenceBuilder;

  beforeEach(() => {
    builder = new ChordSequenceBuilder(new ScaleService());
  });

  it('should fail if requested count < 1', () => {
    expect(()=> { builder.setCount(0); }).toThrow();
  });

  it('should fail if no chord types are given' , () => {
    builder.setCount(3);
    expect(()=> { builder.generate_chords(); }).toThrow();
  });

  it('should fail if it can\'t dedup', () => {
    spyOn(builder, 'gen_one_chord').and.returnValue(new Chord(new Note("C"), 'triad', 'root'));

    builder.setCount(2).setChordTypes(['triad']).addInversion('root',  1);

    expect(() => {builder.setDuplicate('none').generate_chords(); }).withContext('none').toThrowError();
    expect(() => {builder.setDuplicate('not-adjacent').generate_chords(); }).withContext('not adjacent').toThrowError();
    expect(() => {builder.setDuplicate('any').generate_chords(); }).withContext('any').not.toThrowError();

  });


});
