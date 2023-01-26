import { ComponentFixture, TestBed } from '@angular/core/testing';

import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {MatInputModule} from '@angular/material/input';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatGridListModule} from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { MainPageComponent } from './main-page.component';
import { AudioService } from '../audio.service';
import { MatTooltipModule } from '@angular/material/tooltip';
describe('RandomChordsComponent', () => {
  let component: MainPageComponent;
  let fixture: ComponentFixture<MainPageComponent>;

  let audioServiceSpy : jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    audioServiceSpy = jasmine.createSpyObj('MockAudioService', ['play_chord'])
    await TestBed.configureTestingModule({
      imports : [
        FormsModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatExpansionModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatRadioModule,
        MatGridListModule,
        MatIconModule,
        MatDialogModule,
        MatSliderModule,
        MatTooltipModule,
        NoopAnimationsModule,
      ],
      declarations: [ MainPageComponent ],
      providers: [{provide : AudioService, useValue : audioServiceSpy }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /*
  it("should generate chords when button is clicked", fakeAsync(() => {
    const topElement: HTMLElement = fixture.nativeElement;
    const genButton  = topElement.querySelector('#generate_chords_button');

    expect(genButton).toBeTruthy();
    (genButton as HTMLElement).click();

    tick();

    expect(component.chords.length).toBeGreaterThan(0);
  }));
  */
 
});
