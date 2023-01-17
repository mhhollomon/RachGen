import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneratorOptionsComponent } from './generator-options.component';

describe('GeneratorOptionsComponent', () => {
  let component: GeneratorOptionsComponent;
  let fixture: ComponentFixture<GeneratorOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratorOptionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneratorOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
