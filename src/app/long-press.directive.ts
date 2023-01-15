// Based on https://github.com/Gbuomprisco/ngx-long-press
// But modernized


import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';

import { Observable, Subject, interval } from 'rxjs';

import { takeUntil,combineLatestWith, map, switchAll, filter, repeat, tap } from 'rxjs/operators';

@Directive({
    selector: '[longPress]'
})
export class LongPressDirective {
    @Input() public longPress: string = "500";
    @Output() public onLPRelease: EventEmitter<MouseEvent> = new EventEmitter();

    private press_timing = 500;

    public mouseups$ = new Subject();
    public mousedowns$ = new Subject();
    public destroys$ = new Subject();

    public ngOnInit(): void {

      if (this.longPress) {
        this.press_timing = parseInt(this.longPress);
      }

      const interval$ = this.interval$()
          .pipe(takeUntil(this.mouseups$))
          .pipe(combineLatestWith(this.mouseups$));

      this.mousedowns$
          .asObservable()
          .pipe(map(() => interval$))
          .pipe(switchAll())
          .pipe(repeat())
          .pipe(map(items => items[1]))
          .pipe(takeUntil(this.destroys$))
          .subscribe((event) => {
              this.onLPRelease.emit(event as MouseEvent);
          });
    }

    public ngOnDestroy(): void {
        this.destroys$.unsubscribe();
    }

    public interval$(): Observable<number> {
      const delay = 100; // miliseconds
      const timing = this.press_timing;


      return interval(delay).pipe(filter(i => (delay*i) > timing));
    }

    @HostListener('mouseup', ['$event'])
    public onMouseUp(event: MouseEvent): void {
      this.mouseups$.next(event);
    }

    @HostListener('mousedown', ['$event']) 
    public onMouseDown(event: MouseEvent): void {
      this.mousedowns$.next(event);
    }
}