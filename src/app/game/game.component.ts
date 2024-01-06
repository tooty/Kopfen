import { Component } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray , transferArrayItem} from '@angular/cdk/drag-drop';
import { Player } from '../player';
import { Game,ActivePlayer } from '../game';
import { StateService } from '../state.service';
import {CommonModule} from '@angular/common';
import {FormControl, ReactiveFormsModule} from '@angular/forms';
import {Router} from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, DragDropModule, ReactiveFormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})

export class GameComponent {
  players: Player[] = []
  loosers: Player[] = []
  winners: Player[] = []
  games: Game[] = []
  amount = new FormControl(10)

  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = JSON.parse(JSON.stringify(data))
    })
    this.stateService.games$.subscribe((data) => {
      this.games = data
    })
  }

  drop(event: CdkDragDrop<Player[]>){
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

  addGame(){
    if (this.winners.length + this.loosers.length != 4
      || this.winners.length == 0
      || this.loosers.length == 0) {
      console.error("player distribution")
      return
    }

    if (this.amount.value == null  ) {
      console.error("no amount")
      return
    }

    if (this.amount.value%10 != 0) {
      console.error("bad amount")
      return
    }

    let partitipants: ActivePlayer[] = []

    if (this.winners.length == 3) {
      this.winners.forEach(p => {
        let amount = this.amount.value!
        partitipants.push({id: p.id, cost: amount})
      })
      this.loosers.forEach(p => {
        let amount = -this.amount.value! * 3
        partitipants.push({id: p.id, cost: amount})
      })
    } else {
      this.winners.forEach(p => {
        let amount = (this.amount.value! * this.loosers.length) / this.winners.length
        partitipants.push({id: p.id, cost: amount})
      })
      this.loosers.forEach(p => {
        let amount = -this.amount.value!
        partitipants.push({id: p.id, cost: amount})
      })
    }

    let newGame: Game = {
      cost: this.amount.value,
      time: Date.now(),
      players: partitipants
    }

    if (newGame.players.reduce((summ, p) => p.cost + summ, 0) != 0){
      console.error("Game Summ not 0")
      return
    }

    this.stateService.addGame(newGame)
    this.router.navigate([""])
    console.log(console.log(newGame))
  }
}

