import { Component, ViewChild, Input, SimpleChanges } from '@angular/core';
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
  @Input() tableSum: number[][] = [];
  @Input() tableCost: number[][] = [];
  @Input() players: Player[] = [];
  @Input() isLandscape: boolean = false;

  graphData: any;
  barChartOptions: any;
  lineChartData: ChartConfiguration['data'] = { datasets: [] };
  lineChartOptions: ChartConfiguration['options'] = {
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      },
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
        enabled: true,
      },
      legend: {
        position: 'left',
        display: this.isLandscape
      },
    },
  };
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor(private stateService: StateService) {}

  ngOnChanges(changes: SimpleChanges){
    if (changes["tableSum"] || changes["players"]||changes["tableCost"]){
      this.buildData()
    }
    if (changes["isLandscape"]) {
      this.lineChartOptions = {
    maintainAspectRatio: false,
    elements: {
      point: {
        radius: 0,
      },
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
        enabled: true,
      },
      legend: {
        position: 'left',
        display: this.isLandscape
      },
    },
  };
      this.chart?.update();
      console.log("is changed" + this.lineChartOptions!.plugins!.legend!.display)
    }
  }

  ngOnInit() {
    this.buildData();
  }

  transpose(t: number[][]) {
    let trans: number[][] = [];
    trans = t[0].map((col, i) => t.map((row) => row[i]));
    return trans;
  }

  buildData(bar?: boolean): void {
    let tableSumT = this.transpose(this.tableSum);
    let tableCostT = this.transpose(this.tableCost);
    let mycolor: String[]

    tableSumT.forEach((x, i) => {
      this.lineChartData.datasets[2 * i] = {
        data: x,
        type: 'line',
        label: this.players[i].name.toString(),
        borderColor: "hsla("+ i*80 + ", 60%, 70%, 0.7)",
        fill: 'origin',
      };
    });

    tableCostT.forEach((x, i) => {
      this.lineChartData.datasets[2 * i + 1] = {
        data: x,
        type: 'bar',
        hidden: true,
        backgroundColor: "hsla("+ i*80 + ", 60%, 70%, 0.9)",
        label: '𝚫 ' + this.players[i].name.toString(),
      };
    });

    this.lineChartData.labels = this.tableSum.map((x, i) => i);

    this.chart?.update();
  }
}
