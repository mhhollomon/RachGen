import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MidiConfigFormComponent } from './midi-config-form.component';

describe('MidiConfigFormComponent', () => {
  let component: MidiConfigFormComponent;
  let fixture: ComponentFixture<MidiConfigFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MidiConfigFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MidiConfigFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
