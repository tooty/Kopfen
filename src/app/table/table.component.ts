import { CommonModule } from '@angular/common';
import { HostListener, Component, ViewChild } from '@angular/core';
import { Game, Player } from '../interfaces';
import { Router } from '@angular/router';
import { GraphComponent } from '../graph/graph.component';
import Hammer from 'hammerjs';
import { HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, skip, Observable } from 'rxjs';
import { StoreModule, Store } from '@ngrx/store';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [StoreModule, HttpClientModule, CommonModule, GraphComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  players$: Observable<Player[]>
  players: Player[] = []
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
    private router: Router,
    private store: Store<{ players: Player[], game: Game[] }>,
    private helperService: HelperService
  ) {
    [this.table$, this.sum$] = this.helperService.getObservables()
    this.players$ = this.store.select('players')
    this.games$ = this.store.select('game')
    this.players$.subscribe(next => {
      this.players = next
    })
  }

  navigate(route: String) {
    this.router.navigate([route]);
  }

  ngOnInit() {
    const element = document.getElementById('myElement');
    const hammer = new Hammer.Manager(element!);
    hammer.add(new Hammer.Swipe());
    hammer.on('swipeleft', () => this.swipe());
    if (window.screen.width >= 700){
      this.isTablet = true
    if (this.swipeDiv != null) {
      const hammer = new Hammer.Manager(this.swipeDiv!);
      hammer.add(new Hammer.Swipe());
      hammer.on('swipeleft', () => this.swipe());
      if (window.screen.width >= 700) {
        this.isTablet = true
      }
    }
  }
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
