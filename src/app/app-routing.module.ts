import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MainPageComponent } from './main-page/main-page.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';

const routes: Routes = [
    { path : '',                component : MainPageComponent, pathMatch : 'full' },
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
