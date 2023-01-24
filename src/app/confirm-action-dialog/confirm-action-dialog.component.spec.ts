import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmActionDialogComponent } from './confirm-action-dialog.component';

import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ConfirmActionDialogComponent', () => {
  let component: ConfirmActionDialogComponent;
  let fixture: ComponentFixture<ConfirmActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmActionDialogComponent ],
      imports : [
        MatDialogModule,
        NoopAnimationsModule
      ],
      providers : [{provide : MAT_DIALOG_DATA, useValue : "Ooopsy" }],

    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmActionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
