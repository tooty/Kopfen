import {CommonModule} from '@angular/common';
import {  Component } from '@angular/core';
import { Player } from '../player';
import { Game } from '../game';
import { StateService } from '../state.service';
import {Router} from '@angular/router';
import {GraphComponent} from '../graph/graph.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule,GraphComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  playersOver: Player[] = []
  games: Game[] = []
  sum: {p: Player, sum: number[]}[] = []

  constructor(
    private stateService: StateService,
    private router: Router,
  ) {
    this.stateService.players$.subscribe((data) => {
      this.playersOver = JSON.parse(JSON.stringify(data))
    })
    this.stateService.games$.subscribe((data) => {
      this.games = data.sort((a,b)=> b.time-a.time)
      this.sum = stateService.gameSum()
    })
  }

  navigate(route: String){
    this.router.navigate([route])
  }

  metchAmount(player: Player, game: Game): number {
    let match = game.players.find(p => player.id == p.id)
    if (match != null){
      return match.cost
    } else {
      return 0
    }
  }
}
