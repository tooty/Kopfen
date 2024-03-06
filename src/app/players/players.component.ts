import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Player } from '../interfaces';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { validatePlayer,resetLocal } from '../store/player.action';
import { pullGames} from "../store/game.action";

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [HttpClientModule,CommonModule, RouterModule, FormsModule,StoreModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css',
})
export class PlayersComponent {
  players$: Observable<Player[]>
  enoughPlayer$ : Observable<boolean> = new Observable<boolean>()

  constructor(
    private store: Store<{players: Player[]}>
  ) {
    this.players$= store.select('players')
  }

  addPlayer(input: HTMLInputElement) {
    var uuid = uuidv4();
    const newPlayer = { name: input.value, id: uuid, synced: false };

    this.store.dispatch(validatePlayer(newPlayer))
    input.value = '';
  }

  //loadGames(start: Date, end: Date) {
  loadGames() {
    this.store.dispatch(pullGames({start:0,end: Date.now()}))
  }

  reset() {
    this.store.dispatch(resetLocal())
  }
}
