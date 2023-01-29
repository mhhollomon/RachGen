import { defaultModeDegreeList, defaultModeList, DuplicateControl, RandomChordOptions } from '../random-chord.service';
import { Scale, ScaleType } from '../utils/music-theory/scale';
import { List } from 'immutable';


export interface GeneratorOptionProps extends RandomChordOptions {
  count_range_mode: boolean;
  key_source: string;
  tonality: string;
  center: string;
  modes_on: boolean;
}


export function defaultGeneratorOptionProps(): GeneratorOptionProps {
  return {
    count_range_mode: false,
    key_source: 'Random',
    tonality: 'major',
    center: 'Random',

    scale: new Scale(),
    count: { min: 4, max: 6 },
    duplicates: 'none',
    extensions: {
      '7th': { flag: true, weight: 30 },
      '9th': { flag: false, weight: 30 },
      '11th': { flag: false, weight: 30 },
    },
    inversions: {
      'root': { flag: true, weight: 5 },
      'first': { flag: false, weight: 3 },
      'second': { flag: false, weight: 2 },
    },
    chordTypes: {
      'triad': { flag: true, weight: 3 },
      'sus2': { flag: false, weight: 3 },
      'sus4': { flag: false, weight: 3 },
    },
    modes: defaultModeList,
    mode_percent: 0,
    modes_on: false,
    mode_degrees: defaultModeDegreeList,
  };
}

const propKeys = Object.keys(defaultGeneratorOptionProps()).sort();

export class GeneratorOptions implements GeneratorOptionProps {
  private _props : GeneratorOptionProps = defaultGeneratorOptionProps();

  get count_range_mode() { return this._props.count_range_mode; }
  get key_source() { return this._props.key_source; }
  get tonality() { return this._props.tonality; }
  get center() { return this._props.center; }
  get scale() { return this._props.scale; }
  get count() { return this._props.count; }
  get duplicates() { return this._props.duplicates; }
  get extensions() { return this._props.extensions; }
  get inversions() { return this._props.inversions; }
  get chordTypes() { return this._props.chordTypes; }
  get modes() { return this._props.modes; }
  get mode_percent() { return this._props.mode_percent; }
  get modes_on() { return this._props.modes_on; }
  get mode_degrees() { return this._props.mode_degrees; }

  constructor()
  constructor(props : Partial<GeneratorOptionProps>) 
  constructor(props? : Partial<GeneratorOptionProps>) {
    if (props) {
      this._props = { ...this._props, ...props };
    }
  }

  getProps() : GeneratorOptionProps {
    return this._props;
  }

  setRangeMode(r : boolean) : GeneratorOptions {
    return new GeneratorOptions({ ...this._props, count_range_mode : r })
  }

  setScaleSource(s : string ) : GeneratorOptions {
    return new GeneratorOptions({ ...this._props, key_source : s })
  }

  setTonality(t : ScaleType) : GeneratorOptions {
    return new GeneratorOptions({ ...this._props, tonality : t })
  }

  setCenter(v : string) : GeneratorOptions {
    return new GeneratorOptions({ ...this._props, center : v })
  }

  setDuplicates(v : DuplicateControl) : GeneratorOptions {
    return new GeneratorOptions({ ...this._props, duplicates : v })
  }

  update(newProps : Partial<GeneratorOptionProps>) : GeneratorOptions {
    return new GeneratorOptions({...this._props, ...newProps});
  }

  freeze() : Array<any> {

    const p = this._props;

    return [
      GeneratorOptions.classTag,
      this._props.count_range_mode,
      this._props.key_source,
      this._props.tonality,
      this._props.center,
      this._props.scale,
      this._props.count,
      this._props.duplicates,
      this._props.extensions,
      this._props.inversions,
      this._props.chordTypes,
      this._props.modes,
      this._props.mode_percent,
      this._props.modes_on,
      this._props.mode_degrees,    
    ];
    
  }

  toJSON() : any {
      return this.freeze();
  }

  static thaw(p : Array<any>) : GeneratorOptions {

    if (p.length !== propKeys.length+1)
        throw Error(`failed to thaw a GeneratorOptions : ${p}`)

    return new GeneratorOptions({
      count_range_mode: p[1],
      key_source: p[2],
      tonality:   p[3],
      center:     p[4],
      scale:      p[5],
      count:      p[6],
      duplicates: p[7],
      extensions: p[8],
      inversions: p[9],
      chordTypes: p[10],
      modes: List<ScaleType>(p[11]),
      mode_percent: p[12],
      modes_on:     p[13],
      mode_degrees: List<number>(p[14]),    
    });


  }

  static get classTag() { return ':go'; }

}
