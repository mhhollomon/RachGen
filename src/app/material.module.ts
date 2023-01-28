import { NgModule } from '@angular/core';

import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule, MAT_FORM_FIELD_DEFAULT_OPTIONS} from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule, MAT_RADIO_DEFAULT_OPTIONS} from '@angular/material/radio';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule, MAT_TOOLTIP_DEFAULT_OPTIONS} from '@angular/material/tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSliderModule} from '@angular/material/slider';
import {MatMenuModule} from '@angular/material/menu';
import {MatTableModule} from '@angular/material/table'
import {MatDividerModule} from '@angular/material/divider';

import {DragDropModule} from '@angular/cdk/drag-drop';
import {OverlayModule} from '@angular/cdk/overlay';

@NgModule({
    exports: [
        MatTabsModule,
        MatToolbarModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatListModule,
        MatSelectModule,
        MatCardModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatRadioModule,
        MatGridListModule,
        MatExpansionModule,
        MatTooltipModule,
        MatSidenavModule,
        MatIconModule,
        MatDialogModule,
        MatSliderModule,
        MatMenuModule,
        MatTableModule,
        MatDividerModule,
        
        DragDropModule,
        OverlayModule,
    ],
    providers: [
        {provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: {appearance: 'outline', floatLabel: 'always'}},
        {provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue : {showDelay : 1000, }},
        {provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: { color: 'accent' }, },
    ],
    
})
export class MaterialModule {}