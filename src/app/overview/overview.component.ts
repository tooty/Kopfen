import {CommonModule} from '@angular/common';
import { Component } from '@angular/core';
import { Player } from '../player';
import { Game } from '../game';
import { StateService } from '../state.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent {
  playersOver: Player[] = []
  games: Game[] = []
  sum: {p: Player, sum: number[]}[] = []


  constructor(
    private stateService: StateService,
    private router: Router
  ) {
    this.stateService.players$.subscribe((data) => {
      this.playersOver = JSON.parse(JSON.stringify(data))
    })
    this.stateService.games$.subscribe((data) => {
      this.games = data
      this.sum = stateService.gameSum()
    })
  }

  addGame(){
    this.router.navigate(["game"])
  }
  addPlayer(){
    this.router.navigate(["players"])
  }

  relationById(player: Player, game: Game): number {
    let match = game.players.find(p => player.id == p.id)
    if (match != null){
      return match.cost
    } else {
      return 0
    }
  }
}
