import { Component, ViewChild } from '@angular/core';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { StateService } from '../state.service';
import { Game, Player } from '../interfaces';
import { ChartType, ChartConfiguration, Legend } from 'chart.js';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [NgChartsModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  tableSum: number[][]=[]
  tableCost: number[][]=[]
  players: Player[] = []
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
    plugins: {
      colors: {
        enabled: false,
      },
      legend: {
        position: "left"
      }
    }
  };
  lineChartType: ChartType = 'line';

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;
  constructor(private stateService: StateService) {
    this.stateService.sumTable$.subscribe((value) => {
      this.tableSum = value
      this.buildData();
    });

    this.stateService.coastTable$.subscribe((value) => {
      this.tableCost = value
      this.buildData();
    });

    this.stateService.players$.subscribe((value) => {
      this.players = value
    });
  }

  transpose(t: number[][]) {
    t.push(t[0])
    t[0] = t[0].map(() => 0)
    return t[0].map((col, i) => t.map(row => row[i]));
  }

  toggle(){
    this.buildData(true)
  }

  buildData(bar? : boolean): void {
    let tableSumT = this.transpose(this.tableSum)
    let tableCostT = this.transpose(this.tableCost)

    tableSumT.forEach((x, i) => {
      this.lineChartData.datasets[2*i] = {
        data: x,
        type: "line",
        label:  this.players[i].name.toString(),
        fill: 'origin',
      };

    });

    tableCostT.forEach((x, i) => {
      this.lineChartData.datasets[2*i+1] = {
        data: x,
        type: "bar",
        hidden: true,
        backgroundColor: this.lineChartData.datasets[2*i].backgroundColor?.toString,
        label: "𝚫 " + this.players[i].name.toString(),
      };
    })

    this.lineChartData.labels = this.tableSum.map((x,i) => i);

    this.chart?.update();
  }
}
