import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmActionDialogComponent } from './confirm-action-dialog.component';

describe('ClearSettingsDialogComponent', () => {
  let component: ConfirmActionDialogComponent;
  let fixture: ComponentFixture<ConfirmActionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmActionDialogComponent ]
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
