import { CommonModule } from '@angular/common';
import { ViewChild, HostListener, Component } from '@angular/core';
import { Player } from '../interfaces';
import { StateService } from '../state.service';
import { Router } from '@angular/router';
import { GraphComponent } from '../graph/graph.component';
import Hammer from 'hammerjs';

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
  sum: number[][] = [];
  isLandscape = false;
  isTablet = false;

  @HostListener('window:orientationchange', ['$event'])
  orientationchange(event: Event) {
    this.isLandscape =
      screen.orientation.type == 'landscape-secondary' ||
      screen.orientation.type == 'landscape-primary';
  }

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
      this.sum = data;
    });
  }

  navigate(route: String) {
    this.router.navigate([route]);
  }

  ngOnInit() {
    const element = document.getElementById('myElement');
    const hammer = new Hammer.Manager(element!);
    hammer.add(new Hammer.Swipe());
    hammer.on('swipeleft', () => this.swipe());
    if (window.screen.width >= 700){
      this.isTablet = true
    }
  }

  swipe() {
    if (this.isTablet){
      this.isLandscape = !this.isLandscape;
    }
  }

  color(i:number):string{
   return "color:hsla("+ i*80 + ", 60%, 70%, 1)"
  }
}
