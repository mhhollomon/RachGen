import { EventEmitter, Injectable, OnInit, Output } from '@angular/core';

const prefix = 'rg';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService implements OnInit {

  @Output() public prefChange: EventEmitter<string> = new EventEmitter();

  ngOnInit() {
    const blob = localStorage.getItem('rg.theme');

    if (blob) {

      let retval : any = null;
      try {
        retval = JSON.parse(blob);
      } catch(e) {
        this.write('theme', 'light');
      }
    }


  }

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
