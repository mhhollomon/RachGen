import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { RandomChordsComponent } from './random-chords/random-chords.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HelpDialogComponent } from './help-dialog/help-dialog.component';

import { HelpTextEmitterService } from './services/help-text-emitter.service';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component'
import { ThemeService } from './services/theme.service';
import { LongPressDirective } from './long-press.directive';
import { MidiDialogComponent } from './midi-dialog/midi-dialog.component';
import { PreferencesService } from './services/preferences.service';
import { PreferenceDialogComponent } from './preference-dialog/preference-dialog.component';
import { ChordEditDialogComponent } from './chord-edit-dialog/chord-edit-dialog.component';
import { GeneratorOptionsComponent } from './generator-options/generator-options.component';

@NgModule({
  declarations: [
    AppComponent,
    RandomChordsComponent,
    PageNotFoundComponent,
    HelpDialogComponent,
    ErrorDialogComponent,
    LongPressDirective,
    MidiDialogComponent,
    PreferenceDialogComponent,
    ChordEditDialogComponent,
    GeneratorOptionsComponent
  ],
  imports: [
    BrowserModule, 
    BrowserAnimationsModule,
    MaterialModule,

    AppRoutingModule,
  ],
  providers: [
    HelpTextEmitterService,
    PreferencesService,
    { provide: AudioContext, useClass: AudioContext },
    ThemeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
