import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearSettingsDialogComponent } from './clear-settings-dialog.component';

describe('ClearSettingsDialogComponent', () => {
  let component: ClearSettingsDialogComponent;
  let fixture: ComponentFixture<ClearSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClearSettingsDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClearSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
