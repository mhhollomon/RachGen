import { Chord, ExtensionFlags } from './chord';
import { Note  } from './note';
import { List  } from 'immutable';
import { Scale } from './scale';

describe('Chord', () => {
  it('should create an instance', () => {
    expect(new Chord()).toBeTruthy();
  });
});

describe('Chord.name', () => {
  it('should handle major triads', () => {
    const c = new Chord(new Scale('C'), 1, 'triad', 'root');

    expect(c.name()).toBe('C');

    expect(c.setScale(new Scale('Bb')).name()).toBe('Bb');

    expect(c.setScale(new Scale('D')).name()).toBe('D');

  });

  it('should handle minor triads', () => {
    const c = new Chord();

    expect(c.setScale(new Scale('C', 'minor')).name()).toBe('Cmin');

    expect(c.setScale(new Scale('Bb', 'minor')).name()).toBe('Bbmin');

    expect(c.setScale(new Scale('D', 'minor')).name()).toBe('Dmin');

  });

  it('should handle diminished triads', () => {
    const c = new Chord().setDegree(7);

    expect(c.setScale(new Scale('Db')).name()).toBe('Cdim');

    expect(c.setScale(new Scale('Cb')).name()).toBe('Bbdim');

    expect(c.setScale(new Scale('Eb')).name()).toBe('Ddim');

  }); 

/*
  it('should handle major 7th triads', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('E'), 5 : new Note('G'), 7: new Note('B') };
    expect(c.name()).toBe('Cmaj7');

    c.chordTones = { 1: new Note('Bb'), 3 : new Note('D'), 5 : new Note('F'), 7: new Note('A') };
    expect(c.name()).toBe('Bbmaj7');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F#'), 5 : new Note('A'), 7: new Note('C#') };
    expect(c.name()).toBe('Dmaj7');

  });

  it('should handle dominant 7th', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('E'), 5 : new Note('G'), 7: new Note('Bb') };
    expect(c.name()).toBe('C7');

    c.chordTones = { 1: new Note('Bb'), 3 : new Note('D'), 5 : new Note('F'), 7: new Note('Ab') };
    expect(c.name()).toBe('Bb7');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F#'), 5 : new Note('A'), 7: new Note('C') };
    expect(c.name()).toBe('D7');

  }); 

  it('should handle minor 7th', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('Eb'), 5 : new Note('G'), 7: new Note('Bb') };
    expect(c.name()).toBe('Cmin7');

    c.chordTones = { 1: new Note('Bb'), 3 : new Note('Db'), 5 : new Note('F'), 7: new Note('Ab') };
    expect(c.name()).toBe('Bbmin7');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F'), 5 : new Note('A'), 7: new Note('C') };
    expect(c.name()).toBe('Dmin7');

  });

  it('should handle minor 7 b5 (half diminshed)', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('Eb'), 5 : new Note('Gb'), 7: new Note('Bb') };
    expect(c.name()).toBe('Cmin7b5');

    c.chordTones = { 1: new Note('Bb'), 3 : new Note('Db'), 5 : new Note('Fb'), 7: new Note('Ab') };
    expect(c.name()).toBe('Bbmin7b5');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F'), 5 : new Note('Ab'), 7: new Note('C') };
    expect(c.name()).toBe('Dmin7b5');

  });

  it('should handle minor-major 7th', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('Eb'), 5 : new Note('G'), 7: new Note('B') };
    expect(c.name()).toBe('Cminmaj7');

    c.chordTones = { 1: new Note('Bb'), 3 : new Note('Db'), 5 : new Note('F'), 7: new Note('A') };
    expect(c.name()).toBe('Bbminmaj7');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F'), 5 : new Note('A'), 7: new Note('C#') };
    expect(c.name()).toBe('Dminmaj7');

  }); 

  it('should handle diminished 7th', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('Eb'), 5 : new Note('Gb'), 7: new Note('Bbb') };
    expect(c.name()).toBe('Cdim7');

    c.chordTones = { 1:new Note('Bb'), 3 : new Note('Db'), 5 : new Note('Fb'), 7: new Note('Abb') };
    expect(c.name()).toBe('Bbdim7');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F'), 5 : new Note('Ab'), 7: new Note('Cb') };
    expect(c.name()).toBe('Ddim7');

  });

  it('should fail with too few notes', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('Eb') };
    expect(() => {c.name()}).toThrowError();

  });

  it('should fail when triad intervals are not correct', () => {
    const c = new Chord();

    c.chordTones = { 1: new Note('C'), 3 : new Note('D'), 5 : new Note('G') };
    expect(() => {c.name()}).toThrowError();
    c.chordTones = { 1: new Note('C'), 3 : new Note('F'), 5 : new Note('G') };
    expect(() => {c.name()}).toThrowError();
    c.chordTones = { 1: new Note('C'), 3 : new Note('E'), 5 : new Note('A') };
    expect(() => {c.name()}).toThrowError();
    c.chordTones = { 1: new Note('C'), 3 : new Note('E'), 5 : new Note('F#') };
    expect(() => {c.name()}).toThrowError();

  });

  it('should handle add 9', () => {
    const c = new Chord();
    c.extensions = { '7th' : false,  '9th' : true, '11th' : false}
    c.chordType = 'triad';

    c.chordTones = { 1: new Note('C'), 3 : new Note('E'), 5 : new Note('G'), 9: new Note('D') };
    expect(c.name()).toBe('C(add9)');

    c.chordTones = { 1: new Note('Bb'), 3 : new Note('D'), 5 : new Note('F'), 9: new Note('C') };
    expect(c.name()).toBe('Bb(add9)');

    c.chordTones = { 1: new Note('D'), 3 : new Note('F#'), 5 : new Note('A'), 9: new Note('E') };
    expect(c.name()).toBe('D(add9)');

  }); 
  */


});

describe('Chord.noteList', () => {

  it('should handle Emaj(add9)/G♯', () => {
    const c = new Chord(new Scale('E', 'major'), 1, 'triad', 'first')
      .setExtensions(ExtensionFlags({ '7th' : false,  '9th' : true, '11th' : false}));

    expect(c.noteList()).toEqual(
      List<Note>([new Note("G", 1), new Note("E"), new Note('B'), new Note("F", 1)])
    )

  });
});
