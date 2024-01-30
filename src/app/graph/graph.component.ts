import { Component, ViewChild } from '@angular/core';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { StateService } from '../state.service';
import { Game } from '../game';
import { ChartType, ChartConfiguration } from 'chart.js';
import { Player } from '../player';
import 'chartjs-adapter-date-fns'
import { de } from 'date-fns/locale'

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  sum: { p: Player; sum: number[] }[] = [];
  games: Game[]=[]
  graphData: any;
  barChartOptions: any;
  lineChartData: ChartConfiguration['data'] = { datasets: [] };
  lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.3,
      },
    },
    scales: {
      y: {
        position: 'right',
      },
    },
  };
  lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  constructor(private stateService: StateService) {
    this.sum = stateService.gameSum();
    this.stateService.games$.subscribe((data) => {
      this.sum = stateService.gameSum();
      this.games = data
      this.buildData();
    });
  }

  buildData(): void {
    let label: number[] = [];
    this.sum.forEach((x, i) => {
      this.lineChartData.datasets[i] = {
        data: x.sum,
        label: x.p.name.toString(),
        fill: 'origin',
      };
      let arr = [];
      for (let i = 1; i < x.sum.length + 1; i++) {
        arr.push(i);
      }
      if (arr.length != label.length && label.length != 0) {
        console.error('corrupted Data');
      }
      label = arr;
    });
    this.lineChartData.labels = this.games.map((x,i) => i+1);

    this.chart?.update();
  }
}
