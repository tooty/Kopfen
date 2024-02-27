import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Player } from '../interfaces';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
<<<<<<< HEAD
import { StateService } from '../state.service';
=======
import {HttpClientModule} from '@angular/common/http';
import { Observable } from 'rxjs';
import { StoreModule,Store } from '@ngrx/store';
import { validatePlayer,resetLocal } from '../player.action';
>>>>>>> aa47d5a6 (ngrx)

@Component({
  selector: 'app-players',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterModule, FormsModule],
=======
  imports: [HttpClientModule,CommonModule, RouterModule, FormsModule,StoreModule],
>>>>>>> aa47d5a6 (ngrx)
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
  }

  reset() {
    this.store.dispatch(resetLocal())
  }
}
