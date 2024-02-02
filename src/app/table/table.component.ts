import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Player } from '../interfaces';
import { Game } from '../interfaces';
import { StateService } from '../state.service';
import { Router } from '@angular/router';
import { GraphComponent } from '../graph/graph.component';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, GraphComponent],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent {
  players: Player[] = [];
  table: number[][] = [];
  sum: number[] = [];

  constructor(
    private stateService: StateService,
    private router: Router,
  ) {
    this.stateService.players$.subscribe((data) => {
      this.players = data;
    });
    this.stateService.coastTable$.subscribe((data) => {
      this.table = data;
    });
    this.stateService.sumTable$.subscribe((data) => {
      this.sum = data[data.length - 1];
    });
  }

  navigate(route: String) {
    this.router.navigate([route]);
  }
}
