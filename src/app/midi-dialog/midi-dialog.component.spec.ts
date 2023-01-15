import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiDialogComponent } from './midi-dialog.component';

describe('MidiDialogComponent', () => {
  let component: MidiDialogComponent;
  let fixture: ComponentFixture<MidiDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MidiDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
