import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Player } from '../interfaces';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { validatePlayer, resetLocal } from '../store/player.action';
import { pullGamesHttp } from "../store/game.action";
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-players',
    imports: [CommonModule, FormsModule, StoreModule],
    templateUrl: './players.component.html',
    styleUrl: './players.component.css'
})
export class PlayersComponent {
  players$: Observable<Player[]>
  enoughPlayer$: Observable<boolean> = new Observable<boolean>()

  constructor(
    private store: Store<{ players: Player[] }>
  ) {
    this.players$ = store.select('players')
  }

  addPlayer(input: HTMLInputElement) {
    var uuid = uuidv4();
    const newPlayer = { name: input.value, id: uuid, synced: false };

    this.store.dispatch(validatePlayer(newPlayer))
    input.value = '';
  }

  //loadGames(start: Date, end: Date) {
  loadGames(start: string) {
    var date = new Date(start).getTime()
    if (start.length <= 1) {
      date = Date.now() - 1000 * 60 * 6 * 60
    }
    this.store.dispatch(pullGamesHttp({ start: date, end: Date.now() }))
  }

  reset() {
    this.store.dispatch(resetLocal())
  }
}
