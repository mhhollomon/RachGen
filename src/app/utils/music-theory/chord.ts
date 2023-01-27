import { Note } from "./note";
import { Scale } from "./scale";
import { List, Record } from 'immutable'
import { NamedNoteList } from "./NamedNoteList";


export type ChordType = 'triad' | 'sus2' | 'sus4';

export type ExtensionType = '7th' | '9th' | '11th';

export type InversionType = 'root' | 'first' | 'second';


export const ExtensionFlags = Record({
  '7th': true,
  '9th': false,
  '11th': false,

});

const defaultExtensionFlags = ExtensionFlags({'7th' : false });

export type ExtensionFlagsType = typeof defaultExtensionFlags;

function degreeToScale(rootDegree: number, chordal: number) {
  return (chordal + rootDegree - 1);
}

export interface ChordProps {
  scale : Scale;
  degree : number;
  chordType : ChordType;
  inversion : InversionType;
  extensions : ExtensionFlagsType;
}
export type ChordPropsType = keyof ChordProps;

function defaultChordProps() : ChordProps {
    return {
      scale: new Scale(),
      degree: 1,
      chordType: 'triad',
      inversion: 'root',
      extensions: defaultExtensionFlags,
    };
}

const propKeys = Object.keys(defaultChordProps()).sort();




export class Chord  implements ChordProps, NamedNoteList {

  private _props : ChordProps = defaultChordProps();
  get scale()      { return this._props.scale; }
  get degree()     { return this._props.degree; }
  get chordType()  { return this._props.chordType; }
  get inversion()  { return this._props.inversion; }
  get extensions() { return this._props.extensions; }

  private _tones = new Map<number, Note>();

  get root() { return this.scale.get_note(this.degree); }

  // not used interally by the class. up to the UI to handle
  keep = false;

  constructor();
  constructor(props : Partial<ChordProps>);
  constructor(scale: Scale, degree? :number, chordType? : ChordType, inversion? : InversionType);
  constructor(props?: Scale | Partial<ChordProps>, degree? : number, chordType?: ChordType, inversion?: InversionType) {
    
    let newProps : Partial<ChordProps> = {};

    if (props == undefined) {
      // do nothing - takes the initialized defaults
    } else if (props instanceof Scale) {
      if ((degree != undefined) && (degree <= 0 || degree > 7))
        throw Error('Note.constructor : degree is out of range (1-7)');

      newProps.scale = props;
      if (degree != undefined) newProps.degree = degree;
      if (chordType != undefined) newProps.chordType = chordType;
      if (inversion != undefined) newProps.inversion = inversion;

    } else {
      if ('degree' in props) {
        if (props['degree'] == undefined) {
          delete props['degree'];
        } else  if (props['degree'] <= 0 || props['degree'] > 7) {
          throw Error('Note.constructor : degree is out of range (1-7)');
        }
      }

      newProps = props;
    }

    this._props = { ...this._props, ...newProps }


  }

  setScale(s: Scale): Chord {
    return new Chord({ ...this._props, scale : s } );
  }


  setChordType(t: ChordType): Chord {
    return new Chord({ ...this._props, chordType : t } );
  }


  setDegree(degree: number): Chord {
    if (degree <= 0 || degree > 7)
      throw Error('Note.setRootFromDegree : degree is out of range (1-7)');

    return new Chord({ ...this._props, degree : degree } );
  }

  setInversion(inv: InversionType): Chord {
    return new Chord({ ...this._props, inversion : inv } );
  }

  setExtension(ext: ExtensionType, value: boolean): Chord {
    const newExt = this._props.extensions.set(ext, value);
    return new Chord({ ...this._props, extensions : newExt })
  }

  setExtensions(flags: ExtensionFlagsType): Chord {
    return new Chord({ ...this._props, extensions : flags } );
  }

  getRootName(): string { return this.root.name(); }

  private get_tone(index: number): Note {
    const n = this.chordTones.get(index);
    if (n == undefined) {
      throw Error("No tone")
    }

    return n;
  }

  isDim(): boolean {
    return (this.get_tone(1).interval(this.get_tone(5)) !== 7);
  }

  isMin(): boolean {
    return (this.chordType == 'triad')
      && (!this.isDim())
      && (this.chordTones.get(1)?.interval(this.get_tone(3)) === 3);
  }


  change_scale(newScale: Scale): Chord {
    // first try to protect the pitch, 
    // then go for scale degree.

    const index = newScale.notesOfScale().findIndex((v) => v.isSame(this.root));

    let retval = this.setScale(newScale);
    if (index >= 0) {
      // we found the same pitch so fix up the scaleDegree
      retval = retval.setDegree(index + 1);
    }

    return retval;
  }

  isSame(other: Chord) {
    return this.root === other.root && this.chordType === other.chordType;
  }

  inversionAbbrev(): string {

    switch (this.inversion) {
      case 'root': return '(R)';
      case 'first': return '(1)';
      case 'second': return '(2)';
    }
  }

  private get chordTones(): Map<number, Note> {

    if (this._tones != undefined && this._tones.size > 0) return this._tones;

    let tones = new Map<number, Note>();

    const degree = this.degree;
    const scale = this.scale;

    function add_tone(t: number) {
      tones.set(t, scale.get_note(degreeToScale(degree, t)));
    }

    add_tone(1);
    add_tone(5);


    if (this.chordType === 'sus2') {
      add_tone(2);
    } else if (this.chordType === 'sus4') {
      add_tone(4);
    } else {
      add_tone(3);
    }

    if (this.extensions['7th']) {
      add_tone(7);
    }

    if (this.extensions['9th']) {
      add_tone(9);
    }

    if (this.extensions['11th']) {
      add_tone(11);
    }

    this._tones = tones;

    return tones;

  }

  name(): string {

    const ct = this.chordTones;

    function get_tone(index: number): Note {
      const n = ct.get(index);
      if (n == undefined) {
        throw Error("No tone")
      }

      return n;
    }

    if (!ct.has(1)) {
      throw Error("No root tone in the chordTones")
    }

    if (this.chordType === 'sus2' && !ct.has(2)) {
      throw Error("No supertonic tone in  sus2")
    }
    if (this.chordType === 'sus4' && !ct.has(4)) {
      throw Error("No predominant tone in sus4")
    }

    if ((this.chordType === 'triad') && !ct.has(3)) {
      throw Error("No mediant tone in triad")
    }

    if (!(ct.has(5))) {
      throw Error("No dominant tone in the chordTones")
    }

    const chordalOne = get_tone(1);

    let name: string = chordalOne.name();
    let quality = '';
    let sus = '';
    let ext = '';
    const add: string[] = [];

    if (this.chordType === 'sus2') {
      sus = 'sus2';
    } else if (this.chordType === 'sus4') {
      sus = 'sus4';
    } else {

      // triad or 7th
      const int1to3 = chordalOne.interval(get_tone(3));
      const int3to5 = get_tone(3).interval(get_tone(5));

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

    if (ct.has(7)) {
      // has a 7th
      const int5to7 = get_tone(5).interval(get_tone(7));
      if (int5to7 === 3) {
        ext = '7';
        if (quality === 'maj') {
          quality = '';
        }
      } else if (int5to7 === 4) {
        ext = '7';
        if (quality === 'min') {
          ext = 'maj7'
        } else if (quality === '') {
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

      const int1to9 = chordalOne.interval(get_tone(9));

      if (int1to9 == 1) {
        add.push('b9');
      } else if (int1to9 === 2) { // this assumes not phrygian or locrian
        if (ext === '7') {
          ext = '9';
        } else if (ext !== '7') {
          add.push('9');
        }
      } else if (int1to9 === 3) {
        if (!get_tone(9).isSame(get_tone(3))) {
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

      const int1to11 = chordalOne.interval(get_tone(11));

      if (int1to11 === 5) {
        if (ext === '9') {
          ext = '11';
        } else if (ext !== '9') {
          add.push('11');
        }
      } else if (int1to11 === 6) {
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
      add.forEach(v => addtext += v + ',');
      addtext = addtext.substring(0, addtext.length - 1) + ')';
    }


    if (name) {
      name += quality;
      name += ext;
      name += sus;
      name += addtext;
    }


    if (this.inversion !== 'root') {

      let chordalBassTone = 1;

      switch (this.inversion) {
        case 'first': {
          switch (this.chordType) {
            case 'sus2': { chordalBassTone = 2; break; }
            case 'sus4': { chordalBassTone = 4; break; }
            case 'triad': { chordalBassTone = 3; break; }
          }
          break;
        }
        case 'second': { chordalBassTone = 5; break; }
      }

      name += '/' + get_tone(chordalBassTone).name();
    }

    return name;

  }

  nameUnicode() {
    let n = this.name();

    n = n.replaceAll('bb', '\uD834\uDD2B');
    n = n.replaceAll('#', '\u266F');
    n = n.replaceAll('b', '\u266D');
    n = n.replaceAll('x', '\uD834\uDD2A');

    return n;
  }


  noteList(): List<Note> {

    
    const ctl = [...this.chordTones.keys()].sort()
        .map(k => this.chordTones.get(k) || new Note('C'));


    let retval = ctl;

    if (this.inversion !== 'root') {

      // want to "pull out" the nominated root and
      // stick it on the bottom.

      let offset = 0;
      switch (this.inversion) {
        case 'first': { offset = 1; break; }
        case 'second': { offset = 2; break; }
      }

      const root = ctl.slice(offset, offset+1);
      const bottom = ctl.slice(0, offset);
      const top = ctl.slice(offset + 1);

      retval = root.concat(bottom, top);

    }

    return List<Note>(retval);
  }

  freeze() : Array<any> {

    const p = this._props;

    return [
      Chord.classTag,
      p.scale, p.degree,
      p.chordType, p.inversion, p.extensions
    ];
    
  }

  toJSON() : any {
      return this.freeze();
  }

  static thaw(p : Array<any>) : Chord {

    if (p.length !== propKeys.length+1)
        throw Error(`failed to thaw a Chord : ${p}`)

    return new Chord({
      scale: p[1],
      degree: p[2],
      chordType: p[3],
      inversion: p[4],
      extensions: ExtensionFlags(p[5]),
    });


  }

  static get classTag() { return ':c'; }


}

