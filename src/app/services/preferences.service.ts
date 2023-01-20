import { EventEmitter, Injectable, Output } from '@angular/core';

const prefix = 'rg';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  @Output() public prefChange: EventEmitter<string> = new EventEmitter();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  write(key : string, data : any) {

    const realkey = prefix + '.' + key;

    const realdata = JSON.stringify(data);

    localStorage.setItem(realkey, realdata);

    this.prefChange.emit(key);

  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  read(key : string, fallback : any) : any {
    const realkey = prefix + '.' + key;

    const blob = localStorage.getItem(realkey);

    if (blob) {
      return JSON.parse(blob);
    } else {
      return fallback;
    }

  }

  clear_settings() {
    let i = 0;
    let stop = false;

    // get rid of the old "theme" preference
    localStorage.removeItem('theme');

    while(! stop) {
      let key = localStorage.key(i) as  string;
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
