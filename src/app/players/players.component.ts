import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Player } from '../interfaces';
import { ControlerService } from '../controler.service';
import { FormsModule } from '@angular/forms';
import { v4 as uuidv4 } from 'uuid';
import { StateService } from '../state.service';

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
    private controlerService: ControlerService,
    private stateService: StateService,
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = data;
    });
  }

  addPlayer(input: HTMLInputElement) {
    var uuid = uuidv4();
    const newPlayer = { name: input.value, id: uuid, synced: false };
    this.controlerService.addPlayer(newPlayer);
    input.value = '';
  }

  //loadGames(start: Date, end: Date) {
  loadGames() {
    const s = new Date(0);
    const e = new Date()
    this.controlerService.loadServerGames(s,e)
  }

  reset() {
    this.stateService.removeLocalState();
  }
}
