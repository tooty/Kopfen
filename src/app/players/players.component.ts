import {CommonModule} from '@angular/common';
import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import { Player } from '../player';
import { StateService } from '../state.service';
import { Router } from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css'
})
export class PlayersComponent {
  players: Player[] = []

  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = data
    })
  }

  addPlayer(input: HTMLInputElement){
    this.stateService.addPlayer({name: input.value, id: Math.random()})
    input.value  = ""
  }

  reset(){
    this.stateService.reset()
  }
}
