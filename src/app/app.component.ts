import { Component} from '@angular/core';
import { loadIndexDbPlayers } from './player.action';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {StoreModule, Store} from '@ngrx/store'
import { loadIndexDbPlayers } from './store/player.action';
import { loadIndexDbGame } from './store/game.action';
import { Player } from './interfaces';
import { Observable, skip } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StoreModule, HttpClientModule,CommonModule, RouterOutlet, PlayersComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'schafkopf';
  enoughPlayers = true;
  playersCount$ = new Observable<number>


  constructor(
    private store: Store<{players: Player[]}>,
    private router: Router
  ) {
  }

  ngOnInit(){
    this.store.dispatch(loadIndexDbPlayers())
    this.store.dispatch(loadIndexDbGame())
    this.store.select('players').pipe(skip(1)).subscribe(x=> {
      if (x.length < 4)
        this.router.navigate(["players"])
    })
  }
}
