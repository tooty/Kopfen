import {CommonModule} from '@angular/common';
import { Component } from '@angular/core';
import {RouterModule} from '@angular/router';
import { Player } from '../player';
import { StateService } from '../state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './player-overview.component.html',
  styleUrl: './player-overview.component.css'
})
export class PlayerOverviewComponent {
  players: Player[] = []

  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = data
    })
  }

  addPlayer(name: String){
    this.stateService.addPlayer({name: name, id: Math.random()})
  }
}
