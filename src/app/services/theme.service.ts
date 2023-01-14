import { Injectable, Inject, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';


export type ThemeType = 'dark' | 'light';

const ls_key = 'rg.theme';
const old_key = 'theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme : ThemeType = 'light';
  public themeChange = new EventEmitter();

  constructor(@Inject(DOCUMENT) private document: Document) {
    const savedValue = localStorage.getItem(ls_key);

    console.log('localStorage = ', savedValue);
    if (savedValue) {
        this.setTheme(savedValue as ThemeType);
    } else {
      const old_value = localStorage.getItem(old_key);
      if (old_value) {
        this.setTheme(old_value as ThemeType);
      }
    }
  }


  setTheme(newTheme : ThemeType) {
    const darkModeClass = 'darkMode';

    if (newTheme !== this.theme) {
      if (newTheme === 'dark') {
        this.document.body.classList.add(darkModeClass);
      } else {
        this.document.body.classList.remove(darkModeClass);
      }

      this.theme = newTheme;
      this.themeChange.emit(newTheme);
      localStorage.setItem(ls_key, this.theme);
    }

  }

  isDarkMode() { return this.theme === 'dark'; }
}
