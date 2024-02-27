import { Component} from '@angular/core';
<<<<<<< HEAD
import { StateService } from './state.service';
import { Router, RouterOutlet } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
=======
import { RouterOutlet } from '@angular/router';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {StoreModule, Store} from '@ngrx/store'
>>>>>>> aa47d5a6 (ngrx)

@Component({
  selector: 'app-root',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterOutlet, GraphComponent, PlayersComponent],
=======
  imports: [StoreModule, HttpClientModule,CommonModule, RouterOutlet, PlayersComponent],
>>>>>>> aa47d5a6 (ngrx)
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'schafkopf';
  enoughPlayers = true;


<<<<<<< HEAD
  constructor(private stateService: StateService, private router: Router) {
=======
  constructor(
    private store: Store
  ) {
>>>>>>> aa47d5a6 (ngrx)
  }

  ngOnInit(){
    this.store.dispatch({ type: '[App] LoadIndexDbPlayers'})
  }
}
