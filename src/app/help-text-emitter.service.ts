import { Injectable, EventEmitter } from '@angular/core';

export interface help_data {
  help_text : string,
  page_name : string,
}

@Injectable({
  providedIn: 'root'
})
export class HelpTextEmitterService {

  emitter = new EventEmitter();

  setHelp(data : help_data) {
    this.emitter.emit(data);
  }
}

