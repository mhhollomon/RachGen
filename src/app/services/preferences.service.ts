import { EventEmitter, Injectable, Output } from '@angular/core';

const prefix = 'rg';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  @Output() public onChange: EventEmitter<string> = new EventEmitter();

  write(key : string, data : any) {

    const realkey = prefix + '.' + key;

    const realdata = JSON.stringify(data);

    localStorage.setItem(realkey, realdata);

    this.onChange.emit(key);

  }

  read(key : string, fallback : any) : any {
    const realkey = prefix + '.' + key;

    const blob = localStorage.getItem(realkey);

    if (blob) {
      return JSON.parse(blob);
    } else {
      return fallback;
    }

  }
}
