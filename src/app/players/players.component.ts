import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Player } from '../interfaces';
import { StateService } from '../state.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../http.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-players',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './players.component.html',
  styleUrl: './players.component.css',
})
export class PlayersComponent {
  players: Player[] = [];

  constructor(
    private stateService: StateService,
    private httpService: HttpService
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = data;
    });
  }

  addPlayer(input: HTMLInputElement) {
    var uuid = uuidv4();
    console.log(uuid);
    const newPlayer = { name: input.value, id: uuid };
    this.stateService.addPlayer(newPlayer);
    input.value = '';
  }

  //loadGames(start: Date, end: Date) {
  loadGames() {
    const s = 0;
    const e = Date.now();
    this.httpService.getGames(s, e)
      .subscribe((data) => {
        data.map((x) => {
          this.stateService.addGame(x, false);
        });
      });
  }

  reset() {
    this.stateService.removeLocalState();
  }
}
