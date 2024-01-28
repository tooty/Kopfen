import { Component } from '@angular/core';
import {NgChartsModule} from 'ng2-charts';
import {StateService} from '../state.service';
import { Game } from '../game';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css'
})
export class GraphComponent {
  games: Game[] = []
  graphData: any
  barChartOptions: any

  constructor(
    private stateService:StateService
  ){
    this.stateService.games$.subscribe((data)=>{
      this.games = data.sort((a,b)=> b.time-a.time)
      this.graphData = {
        type: 'line',
        data:{
          datasets: [{
            data: [{x: 10,y:10}]
          }]
        }
      }
    })
  }
}
