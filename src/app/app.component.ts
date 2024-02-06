import { Component} from '@angular/core';
import { StateService } from './state.service';
import { Router, RouterOutlet } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
import * as Hammer from 'hammerjs';
import {throwError} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GraphComponent, PlayersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'scharfkopf';
  enoughPlayers = true;


  constructor(private stateService: StateService, private router: Router) {
    this.stateService.players$.subscribe((p) => {
      if (p.length < 4) {
        this.enoughPlayers = false;
      } else {
        this.enoughPlayers = true;
      }
    });
  }
}
