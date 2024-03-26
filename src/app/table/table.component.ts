import { CommonModule } from '@angular/common';
import { HostListener, Component, ViewChild } from '@angular/core';
import { Game, Player } from '../interfaces';
import { GraphComponent } from '../graph/graph.component';
import Hammer from 'hammerjs';
import { HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, skip, of, Observable } from 'rxjs';
import { StoreModule, Store } from '@ngrx/store';
import { OverscrollDirective } from '../overscroll.directive';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [OverscrollDirective, StoreModule, HttpClientModule, CommonModule, GraphComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  players$: Observable<Player[]>
  games$: Observable<Game[]>
  table$: Observable<number[][]>
  sum$: Observable<number[][]>
  loading$ = new Observable<boolean>
  isLandscape = false;
  isTablet = false;

  fun(ev: any) {
    this.loading$ = of(true)
    setTimeout(() => this.loading$ = of(false), 1000)
  }

  constructor(
    private store: Store<{
      table: number[][], sumTable: number[][],
      players: Player[], game: Game[]
    }>,
  ) {
    this.table$ = this.store.select('table')
    this.sum$ = this.store.select('sumTable')
    this.players$ = this.store.select('players')
    this.games$ = this.store.select('game')
  }

  ngOnInit() {
  }

  color(i: number): string {
    return "color:hsla(" + i * 80 + ", 60%, 70%, 1)"
  }

}
