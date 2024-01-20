import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateService} from './state.service';
import { Player } from './player';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'scharfkopf';
  players: Player[] = []

  constructor(
    private stateService: StateService,
    private router: Router
  ){
    this.stateService.players$.subscribe(d=> {
      if (d.length < 4) {
        this.router.navigate(["players"])
      }
    })
  }
}
