import { Component } from '@angular/core';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { Player } from '../interfaces';
import { Game } from '../interfaces';
import { StateService } from '../state.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterModule, CommonModule, DragDropModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
})
export class GameComponent {
  players: { p: Player; c: number }[] = [];
  loosers: { p: Player; c: number }[] = [];
  winners: { p: Player; c: number }[] = [];
  amount = 10;

  constructor(
    private stateService: StateService,
    private router: Router,
  ) {
    this.stateService.players$.subscribe((data) => {
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
    return { cost: this.amount, involved: involved, time: Date.now() };
  }

  updateCost() {
    let game = this.constructGame();
    if (game != null) {
      this.winners.forEach(
        (p) => (p.c = this.stateService.getCost(game!, p.p) ?? 0),
      );
      this.loosers.forEach(
        (p) => (p.c = this.stateService.getCost(game!, p.p) ?? 0),
      );
      this.players.forEach((p) => (p.c = 0));
    }
  }

  addGame(): boolean {
    const myGame = this.constructGame();
    if (myGame == null) {
      return false;
    }
    this.stateService.addGame(myGame);
    this.router.navigate(['']);
    return true;
  }
}
