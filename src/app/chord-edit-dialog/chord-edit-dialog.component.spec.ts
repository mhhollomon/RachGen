import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChordEditDialogComponent } from './chord-edit-dialog.component';

describe('ChordEditDialogComponent', () => {
  let component: ChordEditDialogComponent;
  let fixture: ComponentFixture<ChordEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChordEditDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChordEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
