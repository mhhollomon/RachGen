import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { HelpDialogComponent, help_data } from './help-dialog.component';

describe('HelpDialogComponent', () => {
  let component: HelpDialogComponent;
  let fixture: ComponentFixture<HelpDialogComponent>;

  const dialog_data : help_data = {help_text : 'foo', page_name : 'x' }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports : [
        MatDialogModule, 
        NoopAnimationsModule
      ],
      providers : [{provide : MAT_DIALOG_DATA, useValue : dialog_data }],
      declarations: [ HelpDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
