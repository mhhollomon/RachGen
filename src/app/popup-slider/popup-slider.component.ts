import { AfterViewInit, Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { MatSliderDragEvent } from '@angular/material/slider';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-popup-slider',
  templateUrl: './popup-slider.component.html',
  styleUrls: ['./popup-slider.component.scss']
})
export class PopupSliderComponent  implements AfterViewInit {

  isOpen = false;

  @Input() value = 50;
  @Output() valueChange = new EventEmitter<number>();

  @Input() toolTip : string = 'Blah Blah'
  @Input() max  = 100;
  @Input() min = 10;
  @Input() step = 5;

  @Input() disabled = false;

  private range = 90;

  @ViewChild('sliderOn') private slider_on! :ElementRef;
  
  constructor(
    private theme_service : ThemeService,
  ) {}

  ngAfterViewInit() {

    const on_amt = Math.floor(100*(this.value-this.min)/(this.max-this.min));

    this.slider_on.nativeElement.style.width = `${on_amt}%`
  }

  class_list() {
    if (this.theme_service.isDarkMode()) {
      return 'darkMode popup';
    } else {
      return 'popup';
    }
  }

  update(newValue : number ) {
    const on_amt = Math.floor(100*(newValue-this.min)/(this.max-this.min));

    this.slider_on.nativeElement.style.width = `${on_amt}%`
  }

  dragEnd(event : MatSliderDragEvent) {
    this.valueChange.emit(event.value);

    const on_amt = Math.floor(100*(event.value-this.min)/(this.max-this.min));

    this.slider_on.nativeElement.style.width = `${on_amt}%`
  }

  do_click(event : MouseEvent) {
    if (!this.disabled) {
      this.isOpen = ! this.isOpen;
    }
  }

}
