import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RandomChordsComponent } from './random-chords/random-chords.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';

const routes: Routes = [
    { path : '',                component : RandomChordsComponent, pathMatch : 'full' },
    { path : 'settings',        component : SettingsPageComponent, pathMatch : 'full' },
    { path : 'settings/:topic', component : SettingsPageComponent },

    // page not found
    {path : 'page-not-found',    component : PageNotFoundComponent },
    {path : '**',                component : PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
