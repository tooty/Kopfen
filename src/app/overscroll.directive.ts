import { ElementRef, Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { pullGamesHttp } from './store/game.action';
import { BehaviorSubject, Observable } from 'rxjs';

@Directive({
  selector: '[appOverscroll]',
  standalone: true
})
export class OverscrollDirective {

  constructor(private store: Store, private el: ElementRef) { }
  tochstart = Infinity
  @Output() loading = new EventEmitter(false)

  @HostListener('touchstart', ['$event'])
  scrollPostion(ev: Event) {
    if (this.el.nativeElement instanceof HTMLDivElement) {
      if (ev instanceof TouchEvent && this.el.nativeElement.scrollTop == 0) {
        this.tochstart = ev.touches[0].clientY
      }
    }
  }
  @HostListener('touchmove', ['$event'])
  scrollMove(ev: Event) {
    if (ev instanceof TouchEvent) {
      if (ev.touches[0].clientY - this.tochstart > 200) {
        this.tochstart = Infinity
        this.store.dispatch(pullGamesHttp({ start: Date.now() - 1000 * 60 * 6 * 60, end: Date.now() }))
        if (this.el.nativeElement instanceof HTMLDivElement) {
          this.el.nativeElement.dispatchEvent(new Event('appOverscroll'))
        }
      }
    }
  }
}
