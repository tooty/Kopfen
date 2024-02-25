import { Component} from '@angular/core';
import { StateService } from './state.service';
import { RouterOutlet } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HttpClientModule,CommonModule, RouterOutlet, PlayersComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'schafkopf';
  enoughPlayers = true;


  constructor(private stateService: StateService) {
  }

  ngOnInit(){
    this.stateService.players$.subscribe((p) => {
      if (p.length < 4) {
        this.enoughPlayers = false;
      } else {
        this.enoughPlayers = true;
      }
    });
  }
}
