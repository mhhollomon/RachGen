import { EventEmitter, Injectable, Output } from '@angular/core';

import { pref_key_list } from './pref-keys';

const prefix = 'rg';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService  {

  @Output() public prefChange: EventEmitter<string> = new EventEmitter();

  constructor() {
    const blob = localStorage.getItem('rg.theme');

    if (blob) {

      try {
        JSON.parse(blob);
      } catch(e) {
        this.write('theme', 'light');
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  write(key : string, data : any) {

    this.test_key(key);

    const realkey = prefix + '.' + key;

    const realdata = JSON.stringify(data);

    localStorage.setItem(realkey, realdata);

    this.prefChange.emit(key);


  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  read(key : string, fallback : any) : any {

    this.test_key(key);

    const realkey = prefix + '.' + key;

    const blob = localStorage.getItem(realkey);

    if (blob) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let retval : any = null;
      try {
        retval = JSON.parse(blob);
        return retval;
      } catch(e) {
        console.log(e);
      }
    }

    return fallback;


  }

  test_key(key : string) : boolean {
    if (! pref_key_list.includes(key)) {
      throw Error("unknown")
    }
    return true;
  }

  drop (key : string) {
    this.test_key(key);

    localStorage.removeItem(prefix + '.' + key);
  }

  clear_settings() {
    let i = 0;
    let stop = false;

    // get rid of the old "theme" preference
    localStorage.removeItem('theme');

    while(! stop) {
      const key = localStorage.key(i) as  string;
      if (key != null) {
        if (key.substring(0, prefix.length+1) === (prefix + '.')) {
          localStorage.removeItem(key);
          this.prefChange.emit(key.substring(prefix.length+1));
        } else {
          i += 1;
        }
      } else {
        stop = true;
      }
    }
  }
}
