import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleInfoComponent } from './scale-info.component';

describe('ScaleInfoComponent', () => {
  let component: ScaleInfoComponent;
  let fixture: ComponentFixture<ScaleInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScaleInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScaleInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
