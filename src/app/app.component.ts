import { HostListener, Component, ViewChild } from '@angular/core';
import { StateService } from './state.service';
import { Router, RouterOutlet } from '@angular/router';
import { GraphComponent } from './graph/graph.component';
import { PlayersComponent } from './players/players.component';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

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
  isLandscape = false;
  @HostListener('window:orientationchange', ['$event'])
  orientationchange(event: Event) {
    this.isLandscape = screen.orientation.type == 'landscape-secondary';
  }

  constructor(
    private stateService: StateService,
    private router: Router,
  ) {
    this.stateService.players$.subscribe((p) => {
      if (p.length < 4) {
        this.enoughPlayers = false;
      } else {
        this.enoughPlayers = true;
      }
    });
  }
  ngOnInit() {
    const element = document.getElementById('myElement'); // Replace 'myElement' with the ID of your element
    const hammer = new Hammer.Manager(element!);
    hammer.add(new Hammer.Swipe());
    hammer.on('swipeleft', () => this.swipeUp());
  }

  swipeUp() {
    this.isLandscape = !this.isLandscape;
  }
}
