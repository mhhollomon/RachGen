import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSliderComponent } from './popup-slider.component';

describe('PopupSliderComponent', () => {
  let component: PopupSliderComponent;
  let fixture: ComponentFixture<PopupSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupSliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
