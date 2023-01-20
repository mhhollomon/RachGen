import { Injectable, Inject, EventEmitter } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { PreferencesService } from './preferences.service';
import { filter } from 'rxjs';


export type ThemeType = 'dark' | 'light';

const prefs_key = 'theme';
const default_theme : ThemeType = 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private theme : ThemeType = 'light';
  public themeChange = new EventEmitter();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private prefs : PreferencesService,
  ) {
    const savedValue = this.prefs.read(prefs_key, default_theme);
    this.setTheme(savedValue as ThemeType);

    this.prefs.prefChange.pipe(filter((k) => k===prefs_key)).subscribe(()=>{
      this.prefs_change();
    })

  }

  prefs_change() {
    this.setTheme(this.prefs.read(prefs_key, default_theme));
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
      this.prefs.write(prefs_key, newTheme)
    }

  }

  isDarkMode() { return this.theme === 'dark'; }
}
