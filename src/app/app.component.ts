import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { HelpDialogComponent } from './help-dialog/help-dialog.component';
import { HelpTextEmitterService } from './services/help-text-emitter.service';
import { ThemeService } from './services/theme.service';
import { PreferenceDialogComponent } from './preference-dialog/preference-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'music-stuff';

  current_help_text = 'None';
  current_help_page = 'Unknown';

  header_text = 'Random Chord Generator';

  darkMode = false;


    constructor(
        private router: Router, 
        public dialog: MatDialog, 
        private help_text : HelpTextEmitterService,
        private theme_service : ThemeService
        ) {
    }

    ngOnInit(): void {

        this.help_text.emitter.subscribe( data => {
            this.current_help_text = data.help_text;
            this.current_help_page = data.page_name;
        })

        this.darkMode = this.theme_service.isDarkMode();

        let mq = window.matchMedia("(max-width: 500px)");

        mq.addEventListener("change", () => {this.changeText(mq)})

        

    }

    changeText( mq : MediaQueryList,) {
        if (mq.matches) {
            this.header_text = 'RachGen'
        } else {
            this.header_text = 'Random Chord Generator';
        }
    }

    openHelpDialog() {

        this.dialog.open(HelpDialogComponent, {
            data: {
                help_text: this.current_help_text,
                page_name : this.current_help_page,
            },
        });
    }

    openPreferenceDialog() {
        this.dialog.open(PreferenceDialogComponent, {});
    }

    toggleDarkMode() {
        this.darkMode = ! this.darkMode;

        if (this.darkMode) {
            this.theme_service.setTheme('dark');
        } else {
            this.theme_service.setTheme('light');
        }
    }
}
