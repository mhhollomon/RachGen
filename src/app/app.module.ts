import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MainPageComponent } from './main-page/main-page.component';
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
import { EditCustomComponent } from './chord-edit-dialog/edit-custom/edit-custom.component';
import { ConfirmActionDialogComponent } from './confirm-action-dialog/confirm-action-dialog.component';
import { NewListDialogComponent } from './new-list-dialog/new-list-dialog.component';
import { ScaleChangeDialogComponent } from './scale-change-dialog/scale-change-dialog.component';
import { ScaleInfoComponent } from './scale-info/scale-info.component';
import { MidiConfigFormComponent } from './midi-config-form/midi-config-form.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { CapitalizePipe } from './capitalize.pipe';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    PageNotFoundComponent,
    HelpDialogComponent,
    ErrorDialogComponent,
    LongPressDirective,
    MidiDialogComponent,
    PreferenceDialogComponent,
    ChordEditDialogComponent,
    GeneratorOptionsComponent,
    EditCustomComponent,
    ConfirmActionDialogComponent,
    NewListDialogComponent,
    ScaleChangeDialogComponent,
    ScaleInfoComponent,
    MidiConfigFormComponent,
    SettingsPageComponent,
    CapitalizePipe
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
    ThemeService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
