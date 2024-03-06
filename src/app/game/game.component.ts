import { Component } from '@angular/core';
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
import { Router, RouterModule } from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import { StoreModule,Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { validateGame } from '../store/game.action';
import { HelperService } from '../services/helper.service';


@Component({
  selector: 'app-game',
  standalone: true,
  imports: [StoreModule,RouterModule,HttpClientModule, CommonModule, DragDropModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  players: { p: Player; c: number }[] = [];
  loosers: { p: Player; c: number }[] = [];
  winners: { p: Player; c: number }[] = [];
  amount = 10;
  players$: Observable<Player[]>

  constructor(
    private store: Store<{players: Player[]}>,
    private router: Router,
    private helperService: HelperService
  ) {
    this.players$ = this.store.select('players')
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

  constructGame(): Game | null {
    if (
      this.winners.length + this.loosers.length != 4 ||
      this.winners.length < 1 ||
      this.loosers.length < 1
    ) {
      return null;
    }
    let involved: { playerID: string; winner: boolean }[] = [];
    this.winners.forEach((x) =>
      involved.push({ playerID: x.p.id, winner: true }),
    );
    this.loosers.forEach((x) =>
      involved.push({ playerID: x.p.id, winner: false }),
    );
    return { cost: this.amount, involved: involved, time: Date.now(), synced: false };
  }

  updateCost() {
    let game = this.constructGame();
    if (game != null) {
      this.winners.forEach(
        (p) => (p.c = this.helperService.gameCost(game!, p.p) ?? 0),
      );
      this.loosers.forEach(
        (p) => (p.c = this.helperService.gameCost(game!, p.p) ?? 0),
      );
      this.players.forEach((p) => (p.c = 0));
    }
  }

  addGame(): boolean {
    const myGame = this.constructGame();
    if (myGame == null) {
      return false;
    }
    this.store.dispatch(validateGame(myGame))
    this.router.navigate(['']);
    return true;
  }
}

