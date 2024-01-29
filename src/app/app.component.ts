import { HostListener,  Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {StateService} from './state.service';
import { Router, RouterOutlet } from '@angular/router';
import {GraphComponent} from './graph/graph.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, GraphComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'scharfkopf';
  enoughPlayers = true
  isLandscape = false
  @HostListener ("window:orientationchange", ['$event'])
  orientationchange(event: Event) {
     this.isLandscape = screen.orientation && screen.orientation.angle !== 0;
  }

  constructor(
    private stateService: StateService,
    private router: Router
  ){
    this.stateService.players$.subscribe(p => {
      if (p.length < 4) {
        this.router.navigate(["players"])
        this.enoughPlayers = false
      }
      else {
        this.enoughPlayers = true
      }
    })
  }
}
