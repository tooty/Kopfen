import { Component, Output } from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Player } from '../interfaces';
import { Game } from '../interfaces';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { StoreModule, Store } from '@ngrx/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { validateGame } from '../store/game.action';

@Component({
  selector: 'app-game',
  imports: [
    StoreModule,
    HttpClientModule,
    CommonModule,
    DragDropModule,
    FormsModule,
  ],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  players: { p: Player; c: number }[] = [];
  loosers: { p: Player; c: number }[] = [];
  winners: { p: Player; c: number }[] = [];
  amount = 10;
  players$: Observable<Player[]>;
  @Output() $game: Observable<Game | null>;
  game = new BehaviorSubject<Game | null>(null);

  constructor(private store: Store<{ players: Player[] }>) {
    this.$game = this.game.asObservable();
    this.players$ = this.store.select('players');
    this.players$.subscribe((data) => {
      this.players = data.map((p) => {
        return { p: p, c: 0 };
      });
    });
  }

  drop(event: CdkDragDrop<{ p: Player; c: number }[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.updateCost();
  }

  doubleAmount() {
    this.amount = 2 * this.amount;
    this.updateCost();
  }

  addAmount(x: number) {
    this.amount += x;
    this.updateCost();
  }

  constructGame() {
    if (
      this.winners.length + this.loosers.length != 4 ||
      this.winners.length < 1 ||
      this.loosers.length < 1
    ) {
      this.game.next(null);
      return;
    }
    let involved: { playerID: string; winner: boolean }[] = [];
    this.winners.forEach((x) =>
      involved.push({ playerID: x.p.id, winner: true }),
    );
    this.loosers.forEach((x) =>
      involved.push({ playerID: x.p.id, winner: false }),
    );
    this.game.next({
      cost: this.amount,
      involved: involved,
      time: Date.now(),
      synced: false,
    });
  }

  updateCost() {
    this.constructGame();
    if (this.game.value != null) {
      this.winners.forEach(
        (p) => (p.c = this.gameCost(this.game.value!, p.p) ?? 0),
      );
      this.loosers.forEach(
        (p) => (p.c = this.gameCost(this.game.value!, p.p) ?? 0),
      );
      this.players.forEach((p) => (p.c = 0));
    }
  }

  gameCost(game: Game, player: Player): number | null {
    let winnerCount = 0;

    game.involved.forEach((p) => {
      if (p.winner) {
        winnerCount++;
      }
    });

    const serchedPlayer = game.involved.find((x) => x.playerID == player.id);
    if (serchedPlayer == undefined) {
      return null;
    }

    if (serchedPlayer.winner) {
      if (winnerCount == 1) {
        return game.cost * 3;
      }
      return game.cost;
    } else {
      if (winnerCount == 3) {
        return -game.cost * 3;
      }
      return -game.cost;
    }
  }

  addGame() {
    const myGame = this.constructGame();
    if (myGame == null) {
      return;
    }
    this.store.dispatch(validateGame(myGame));
  }
}
