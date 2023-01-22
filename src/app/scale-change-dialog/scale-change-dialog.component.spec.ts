import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleChangeDialogComponent } from './scale-change-dialog.component';

describe('ScaleChangeDialogComponent', () => {
  let component: ScaleChangeDialogComponent;
  let fixture: ComponentFixture<ScaleChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleChangeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScaleChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
