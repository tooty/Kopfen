import { HostListener, Component } from '@angular/core';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
import { StoreModule, Store } from '@ngrx/store';
import { loadIndexDbPlayers } from './store/player.action';
import {
  loadIndexDbGame,
  pullGamesHttp,
  validateGame,
} from './store/game.action';
import { Player, Game, Screen } from './interfaces';
import { BehaviorSubject, Observable, of, skip, take } from 'rxjs';
import { GameComponent } from './game/game.component';
import { GraphComponent } from './graph/graph.component';
import { TableComponent } from './table/table.component';
import { WebSocketService } from './services/web-socket.service';
import { VisionComponent } from './vision/vision.component';
import {MatToolbarModule} from '@angular/material/toolbar'
import {MatIconModule} from '@angular/material/icon'

@Component({
  selector: 'app-root',
  imports: [
    StoreModule,
    GameComponent,
    TableComponent,
    GraphComponent,
    CommonModule,
    PlayersComponent,
    VisionComponent,
    MatToolbarModule,
    MatIconModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'schafkopf';
  $playersCount = new Observable<number>();
  screen = new BehaviorSubject<Screen>(Screen.table);
  menu = new BehaviorSubject<boolean>(false);
  $menu: Observable<boolean>;
  $screen: Observable<Screen>;
  game: Game | null = null;
  isLandscape = false;
  socketService = new WebSocketService();

  @HostListener('window:orientationchange', ['$event'])
  onOrientatinoChange(event: Event) {
    this.isLandscape = screen.orientation && screen.orientation.angle !== 0;
  }

  constructor(private store: Store<{ players: Player[] }>) {
    this.$screen = this.screen.asObservable();
    this.$menu = this.menu.asObservable()
  }

  ngOnInit() {
    this.socketService.socket$.subscribe({
      next: () => {
        this.store.dispatch(
          pullGamesHttp({
            start: Date.now() - 1000 * 60 * 6 * 60,
            end: Date.now(),
          }),
        );
      },
    });

    this.store.dispatch(loadIndexDbPlayers());
    this.store.dispatch(loadIndexDbGame());
    this.store.dispatch(
      pullGamesHttp({
        start: Date.now() - 1000 * 60 * 6 * 60,
        end: Date.now(),
      }),
    );

    this.store
      .select('players')
      .subscribe((x) => (this.$playersCount = of(x.length)));
    this.store
      .select('players')
      .pipe(skip(1), take(1))
      .subscribe((x) => {
        if (x.length <= 3) this.screen.next(Screen.player);
      });
    this.screen.subscribe(()=>{
      this.menu.next(false)
    })
  }

  menuToggle(){
    this.menu.next(!this.menu.getValue())
  }

  dispatchGame() {
    if (this.game != null) {
      this.store.dispatch(validateGame(this.game));
      this.game = null;
      this.screen.next(Screen.table);
    }
  }
}
