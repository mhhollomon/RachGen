import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCustomComponent } from './edit-custom.component';

describe('EditCustomComponent', () => {
  let component: EditCustomComponent;
  let fixture: ComponentFixture<EditCustomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCustomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCustomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
