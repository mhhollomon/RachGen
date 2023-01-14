import { Note } from "./note";

export type ChordType = 'triad' | 'sus2' | 'sus4';

export type ExtensionType = '7th' | '9th' | '11th';

export type InversionType = 'root' | 'first' | 'second'; 

export interface ExtensionFlags {
  '7th' : boolean,
  '9th' : boolean;
  '11th' : boolean;
}

type ChordToneList = { [key : string] : Note };

export class Chord {
    root : Note;
    inversion : InversionType;
    chordType : ChordType;
    chordTones : ChordToneList = {};
    extensions : ExtensionFlags = {'7th' : false, '9th' : false, '11th' : false};

    // not used interally by the class. up to the UI to handle
    keep = false;
  
    constructor(root  = new Note('C'),  chordType : ChordType = 'triad', inversion : InversionType = 'root') {
      this.root = root;
      this.inversion = inversion;
      this.chordType = chordType;

    }

    addChordTone(chordalPosition : number, note : Note) : Chord {
      this.chordTones[chordalPosition] = note;

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
          if (quality === '' && ext === '7') {
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
          if (quality === '' && ext === '9') {
            ext = '11';
          } else if (ext !== '9') {
            add.push('11');
          }
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

      n = n?.replaceAll('bb', '\uD834\uDD2B' );
      n = n?.replaceAll('#', '\u266F' );
      n = n?.replaceAll('b', '\u266D' );
      n = n?.replaceAll('x', '\uD834\uDD2A' );

      return n;
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
  
  