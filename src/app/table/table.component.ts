import { CommonModule } from '@angular/common';
import { HostListener, Component, ViewChild } from '@angular/core';
import { Game, Player } from '../interfaces';
import { GraphComponent } from '../graph/graph.component';
import Hammer from 'hammerjs';
import { HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, skip, Observable } from 'rxjs';
import { StoreModule, Store } from '@ngrx/store';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [StoreModule, HttpClientModule, CommonModule, GraphComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  players$: Observable<Player[]>
  games$: Observable<Game[]>
  table$: Observable<number[][]>
  sum$: Observable<number[][]>
  isLandscape = false;
  isTablet = false;
  @HostListener('window:orientationchange', ['$event'])
  @ViewChild('myElement') swipeDiv: HTMLDivElement | null = null


  orientationchange(event: Event) {
    this.isLandscape =
      screen.orientation.type == 'landscape-secondary' ||
      screen.orientation.type == 'landscape-primary';
  }

  constructor(
    private store: Store<{
      table: number[][], sumTable: number[][],
      players: Player[], game: Game[] }>,
  ) {
    this.table$ = this.store.select('table')
    this.sum$ = this.store.select('sumTable')
    this.players$ = this.store.select('players')
    this.games$ = this.store.select('game')
  }

  ngOnInit() {
  //  const element = document.getElementById('myElement');
  //  const hammer = new Hammer.Manager(element!);
  //  hammer.add(new Hammer.Swipe());
  //  hammer.on('swipeleft', () => this.swipe());
  //  if (window.screen.width >= 700){
  //    this.isTablet = true
  //  if (this.swipeDiv != null) {
  //    const hammer = new Hammer.Manager(this.swipeDiv!);
  //    hammer.add(new Hammer.Swipe());
  //    hammer.on('swipeleft', () => this.swipe());
  //    if (window.screen.width >= 700) {
  //      this.isTablet = true
  //    }
  //  }
  //}
  }

  swipe() {
    if (this.isTablet) {
      this.isLandscape = !this.isLandscape;
    }
  }

  color(i: number): string {
    return "color:hsla(" + i * 80 + ", 60%, 70%, 1)"
  }

}
