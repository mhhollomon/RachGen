import { Note } from "./note";
import { Scale } from "./scale";

const octavePlacement : { [ index : string ] : number } = {
  'C' : 0, 'D' : 1, 'E' : 2, 'F' : 3, 'G' : 4, 'A' : 5, 'B' : 6 
}

export type ChordType = 'triad' | 'sus2' | 'sus4';

export type ExtensionType = '7th' | '9th' | '11th';

export type InversionType = 'root' | 'first' | 'second'; 

export interface ExtensionFlags {
  '7th' : boolean,
  '9th' : boolean;
  '11th' : boolean;
}

type ChordToneList = { [key : string] : Note };

function degreeToScale(rootDegree : number, chordal : number) {
  return (chordal-1 + rootDegree-1)%7
}


export class Chord {
    private rootCache : Note;
    private rootDegree  = 1;
    inversion : InversionType;
    private chordTypeCache : ChordType = 'triad';
    private chordTonesCache : ChordToneList = {};
    private needChordTones  = true;

    extensions : ExtensionFlags = {'7th' : false, '9th' : false, '11th' : false};

    // used for SCALE property;
    private scaleCache : Scale = new Scale("C", 'major')

    // not used interally by the class. up to the UI to handle
    keep = false;
  
    constructor(root  = new Note('C'),  chordType : ChordType = 'triad', inversion : InversionType = 'root') {
      this.rootCache = root;
      this.inversion = inversion;
      this.chordType = chordType;

    }

    get chordTones() : ChordToneList {
      if (this.needChordTones) {
        this.generate_chord_tones();
      }
      return this.chordTonesCache;
    }

    get scale() : Scale {
      return this.scaleCache;
    }

    set scale(s : Scale) {
      this.scaleCache = s;
      this.needChordTones = true;
      this.setRootFromDegree(this.rootDegree);
    }

    setScale(s : Scale ) : Chord {
      this.scale = s;

      return this;
    }

    get chordType() { return this.chordTypeCache; }
    set chordType(ct : ChordType ) {
      this.setChordType(ct);
    }

    setChordType(t : ChordType) {
      if (t !== this.chordType ) {
        this.chordTypeCache = t;
        this.needChordTones = true;
      }
      return this;
    }

    get root() : Note { return this.rootCache; }
    getRootName() : string { return this.rootCache.note(); }

    setRoot(root : Note, degree : number) : Chord {
      if (degree <= 0 || degree > 7 )
        throw Error('Note.setRoot : degree is out of range (1-7)');

      this.rootCache = root;
      this.rootDegree = degree;
      this.needChordTones = true;

      return this;
    }

    setRootFromDegree(degree : number) : Chord {
      if (degree <= 0 || degree > 7 )
        throw Error('Note.setRootFromDegree : degree is out of range (1-7)');

      // if needChordTones then something else about the chord
      // has changed, it might be the scale, so rootCache needs
      // to be recalculated.
      if (degree !== this.rootDegree || this.needChordTones) {
        this.rootDegree = degree;
        this.rootCache = this.scaleCache.notesOfScale()[degree - 1];
        this.needChordTones = true;
      }

      return this;

    }

    setInversion(inv : InversionType) : Chord {
      this.inversion = inv;

      return this;
    }

    setExtension(ext : ExtensionType, value : boolean) : Chord {
      if (value !== this.extensions[ext]) {
        this.extensions[ext] = value;
        this.needChordTones = true;
      }

      return this;
    }

    isDim() : boolean {
      return (this.chordTones[1].interval(this.chordTones[5]) !== 7);
    }

    deepEqual(o : Chord) {
      return (this.root === o.root) 
          && (this.rootDegree === o.rootDegree)
          && (this.inversion === o.inversion)
          && (this.chordType === o.chordType)
          && (this.extensions["7th"] = o.extensions["7th"])
          && (this.extensions["9th"] = o.extensions["9th"])
          && (this.extensions["11th"] = o.extensions["11th"])
    }

    clone() : Chord {
      const clone = new Chord(this.root, this.chordType, this.inversion);
      clone.scaleCache = this.scaleCache;
      clone.rootDegree = this.rootDegree;
      Object.assign(clone.extensions, this.extensions);
      clone.keep = this.keep;

      return clone;
    }

    private addChordTone(chordalPosition : number, note : Note) : Chord {
      this.chordTonesCache[chordalPosition] = note;

      return this;
    }
  
    isSame(other : Chord) {
      return this.root === other.root && this.chordType === other.chordType;
    }

    inversionAbbrev() : string {

      switch (this.inversion) {
        case 'root' : return '(R)';
        case 'first' : return '(1)';
        case 'second' : return '(2)';
      }
    }

    private generate_chord_tones() {
      this.chordTonesCache = {};

      const scaleNotes = this.scale.notesOfScale();

      this.addChordTone(1, scaleNotes[degreeToScale(this.rootDegree, 1)]);
      this.addChordTone(5, scaleNotes[degreeToScale(this.rootDegree, 5)]);
  
      if (this.chordType === 'sus2') {
        this.addChordTone(2, scaleNotes[degreeToScale(this.rootDegree, 2)]);
      } else if (this.chordType === 'sus4') {
        this.addChordTone(4, scaleNotes[degreeToScale(this.rootDegree, 4)]);
      } else {
        this.addChordTone(3, scaleNotes[degreeToScale(this.rootDegree, 3)]);
      }

      if (this.extensions['7th']) {
        this.addChordTone(7, scaleNotes[degreeToScale(this.rootDegree, 7)]);
      }
      
      if (this.extensions['9th']) {
        this.addChordTone(9, scaleNotes[degreeToScale(this.rootDegree, 9)]);
      }
  
      if (this.extensions['11th']) {
        this.addChordTone(11, scaleNotes[degreeToScale(this.rootDegree, 11)]);
      }
  
      this.needChordTones = false;
    }

    name() : string {

      // Just for convenience 
      const ct = this.chordTones;

      if (! (1 in ct)) {
        throw Error("No root tone in the chordTones")
      }

      if (this.chordType === 'sus2' && ! (2 in ct)) {
        throw Error("No supertonic tone in  sus2")
      }
      if (this.chordType === 'sus4' && ! (4 in ct)) {
        throw Error("No predominant tone in sus4")
      }

      if ((this.chordType === 'triad') && ! ( 3 in ct)) {
        throw Error("No mediant tone in triad")
      }

      if (! ( 5 in ct)) {
        throw Error("No dominant tone in the chordTones")
      }

      const chordalOne = ct[1];

      let name : string = chordalOne.note();
      let quality = '';
      let sus = '';
      let ext = '';
      const add : string[] = [];

      if (this.chordType === 'sus2') {
        sus = 'sus2';
      } else if (this.chordType === 'sus4') {
        sus = 'sus4';
      } else {

        // triad or 7th
        const int1to3 = chordalOne.interval(ct[3]);
        const int3to5 = ct[3].interval(ct[5]);

        if (int1to3 === 3) {
          if (int3to5 === 3) {
            quality = 'dim';
          } else if (int3to5 === 4) {
            quality = 'min';
          } else {
            throw Error("Invalid lower chord structure (min first)");
          }
        } else if (int1to3 === 4) {
          if (int3to5 === 3) {
            quality = 'maj';
          } else if (int3to5 === 4) {
            quality = 'aug';
          } else {
            throw Error("Invalid lower chord structure (maj first)");
          }
        } else {
          throw Error("invalid first interval in chord.");
        }
      }

      if ( 7 in ct ) {
        // has a 7th
        const int5to7 = ct[5].interval(ct[7]);
        if (int5to7 === 3) {
          ext = '7';
          if (quality === 'maj') {
            quality = '';
          }
        } else if (int5to7 === 4) {
          ext = '7';
          if (quality === 'min') {
            ext = 'maj7'
          } else if (quality === ''){
            ext = 'maj7'
          } else if (quality === 'dim') {
            quality = 'min';
            ext = '7b5'
          }
        } else if (this.extensions['7th']) {
          throw Error("Invalid interval to 7th");
        }
      }

      if (this.extensions["9th"]) {
        // Has a nine

        const int1to9 = ct[1].interval(ct[9]);

        if (int1to9 == 1 ) {
            add.push('b9');
        } else if (int1to9 === 2) { // this assumes not phrygian or locrian
          if (ext === '7') {
            ext = '9';
          } else if (ext !== '7') {
            add.push('9');
          }
        } else if (int1to9 === 3) {
          if (! ct[9].same(ct[3])) {
            add.push('#9');
          } else {
            // not actually a  ninth chord, 
            // the chordal 3 is simply repeated.
          }
        } else {
          throw Error("Invalid interval to 9th");
        }

      }

      if (this.extensions["11th"]) {

        const int1to11 = ct[1].interval(ct[11]);

        if (int1to11 === 5 ) {
          if (ext === '9') {
            ext = '11';
          } else if (ext !== '9') {
            add.push('11');
          }
        } else if (int1to11 === 6 ) {
          add.push("#11");
        } else {
          throw Error("Invalid interval to 11th")
        }


      }


      if (quality == 'maj' && ext === '') {
        quality = '';
      }

      let addtext = '';
      if (add.length > 0) {
        addtext = '(add'
        add.forEach(v => addtext+=v+',');
        addtext = addtext.substring(0, addtext.length-1) + ')';
      }


      if (name) {
        name += quality;
        name += ext;
        name += sus;
        name += addtext;
      }


      if (this.inversion !== 'root') {

        let  chordalBassTone = 1;

        switch(this.inversion) {
          case 'first' : {
            switch (this.chordType) {
              case 'sus2' : { chordalBassTone = 2; break; }
              case 'sus4' : { chordalBassTone = 4; break; }
              case 'triad' : { chordalBassTone = 3; break; }
            }
            break;
          }
          case 'second' : { chordalBassTone = 5; break; }
        } 

        name += '/' + ct[chordalBassTone].note();
      }

      return name;

    }

    computeNameDisplay() {
      let n = this.name();

      n = n.replaceAll('bb', '\uD834\uDD2B' );
      n = n.replaceAll('#', '\u266F' );
      n = n.replaceAll('b', '\u266D' );
      n = n.replaceAll('x', '\uD834\uDD2A' );

      return n;
    }


    voiceChord() : string[] {
      const tones : string[] = [];
      let octave = 3;
      let last  = -1;
      let isBassNote = true;
  
      for (const c of this.invertedChordTones()) {

        const simpleNote = c.toSharp();
  
        if (octavePlacement[simpleNote.noteClass] < last) {
          octave += 1;
        }
        tones.push(simpleNote.note() + octave);

        if (isBassNote) {
          octave += 1;
          isBassNote = false;
        } else {
          last = octavePlacement[simpleNote.noteClass];
        }
  
      }

      return tones;
  
    }

    invertedChordTones() : Note[] {

      let retval : Note[] = [];
      for (const t in this.chordTones) {
        retval.push(this.chordTones[t]);
      }

      if (this.inversion !== 'root') {

        // want to "pull out" the nominated root and
        // stick it on the bottom.

        let offset = 0;
        switch (this.inversion) {
            case 'first' : { offset = 1; break }
            case 'second' : { offset = 2; break; }
        }
        const newRoot = retval[offset];
        const top = retval.slice(offset+1);
        retval = [newRoot].concat(retval.slice(0, offset)).concat(top);
  
      }

      return retval;

    }
  }
  
  