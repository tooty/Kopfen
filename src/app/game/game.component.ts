import { Component } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray , transferArrayItem} from '@angular/cdk/drag-drop';
import { Player } from '../player';
import { Game,ActivePlayer } from '../game';
import { StateService } from '../state.service';
import {CommonModule} from '@angular/common';
import {FormControl, FormsModule} from '@angular/forms';
import {Router, RouterModule} from '@angular/router';

@Component({
    selector: 'app-game',
    imports: [RouterModule, CommonModule, DragDropModule, FormsModule],
    templateUrl: './game.component.html',
    styleUrl: './game.component.css'
})

export class GameComponent {
  players: {p: Player,c: number}[] = []
  loosers: {p: Player,c: number}[] = []
  winners: {p: Player,c: number}[] = []
  amount = 10

  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = data.map(p =>{return {p: p, c: 0}})
    })
  }

  drop(event: CdkDragDrop<{p: Player,c: number}[]>){
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
    this.updateCost()
  }

  doubleAmount(){
    this.amount= 2 * this.amount
    this.updateCost()
  }

  addAmount(x: number){
    this.amount += x
    this.updateCost()
  }

  updateCost(): boolean{
    if (this.winners.length + this.loosers.length != 4
      || this.winners.length == 0
      || this.loosers.length == 0) {
      console.error("player distribution")
      return false
    }

    if (this.amount <= 0  ) {
      console.error("no amount")
      return false
    }

    if (this.amount %10 != 0) {
      console.error("bad amount")
      return false
    }

    if (this.winners.length == 3) {
      this.winners.forEach(p => {
        let amount = this.amount
        p.c = amount
      })
      this.loosers.forEach(p => {
        let amount = -this.amount * 3
        p.c = amount
      })
    } else {
      this.winners.forEach(p => {
        let amount = (this.amount * this.loosers.length) / this.winners.length
        p.c = amount
      })
      this.loosers.forEach(p => {
        let amount = -this.amount
        p.c = amount
      })
    }
    return true
  }

  addGame(){
    if (!this.updateCost()) {return}
    let players: ActivePlayer[] = []

    this.winners.forEach(p => players.push({id: p.p.id, cost: p.c}))
    this.loosers.forEach(p => players.push({id: p.p.id, cost: p.c}))

    let newGame: Game = {
      cost: this.amount,
      time: Date.now(),
      players: players
    }

    if (newGame.players.reduce((summ, p) => p.cost + summ, 0) != 0){
      console.error("Game Summ not 0")
      return
    }

    this.stateService.addGame(newGame)
    this.router.navigate([""])
  }
}

