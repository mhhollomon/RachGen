import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';

import { GeneratorOptionsComponent } from './generator-options.component';

describe('GeneratorOptionsComponent', () => {
  let component: GeneratorOptionsComponent;
  let fixture: ComponentFixture<GeneratorOptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneratorOptionsComponent ],
      imports: [ 
        MatFormFieldModule, 
        MatSelectModule,
        MatIconModule,
        MatCheckboxModule,
        MatSliderModule, 
      ],
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
