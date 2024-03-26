import { Component, ViewChild, Input, SimpleChanges } from '@angular/core';
import { NgChartsModule, BaseChartDirective } from 'ng2-charts';
import { Game, Player } from '../interfaces';
import { ChartType, ChartConfiguration, Legend } from 'chart.js';
import { HttpClientModule } from '@angular/common/http';
import { merge, Observable, Subject, switchMap, of, tap } from 'rxjs';
import { StoreModule, Store } from '@ngrx/store';

@Component({
  selector: 'app-graph',
  standalone: true,
  imports: [HttpClientModule, NgChartsModule, StoreModule],
  templateUrl: './graph.component.html',
  styleUrl: './graph.component.css',
})
export class GraphComponent {
  tableSum$: Observable<number[][]>
  tableSum: number[][] = []
  tableCost$: Observable<number[][]>
  tableCost: number[][] = []
  regenObs = new Subject<void>

  players$: Observable<Player[]>
  players: Player[] = []

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

  constructor(
    private store: Store<{ players: Player[], table: number[][], sumTable: number[][] }>,
  ) {
    this.tableCost$ = this.store.select('table')
    this.tableSum$ = this.store.select('sumTable')
    this.players$ = this.store.select('players')
    merge(
      this.tableSum$.pipe(tap(x => this.tableSum = x)),
      this.players$.pipe(tap(x => this.players = x)),
      this.tableCost$.pipe(tap(x => this.tableCost = x)),
    ).pipe(switchMap(() => { this.buildData(); return of(null) }))
      .subscribe()
  }

  ngOnChanges(changes: SimpleChanges) {
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
    }
  }

  ngOnInit() {
    this.buildData();
  }

  transpose(t: number[][]) {
    let trans: number[][] = [];
    if (t?.length ?? 0 >= 1) {
      trans = t[0].map((col, i) => {
        return t.map((row) => row[i])
      });
    }
    return trans;
  }

  buildData(bar?: boolean): void {
    let tableSumT = this.transpose(this.tableSum);
    let tableCostT = this.transpose(this.tableCost);

    tableSumT.forEach((x, i) => {
      this.lineChartData.datasets[2 * i] = {
        data: x,
        type: 'line',
        label: this.players[i]?.name.toString(),
        borderColor: "hsla(" + i * 80 + ", 60%, 70%, 0.7)",
        fill: 'origin',
      };
    });

    tableCostT.forEach((x, i) => {
      this.lineChartData.datasets[2 * i + 1] = {
        data: x,
        type: 'bar',
        hidden: true,
        backgroundColor: "hsla(" + i * 80 + ", 60%, 70%, 0.9)",
        label: '𝚫 ' + this.players[i].name.toString(),
      };
    });

    if (this.tableSum != undefined) {
      this.lineChartData.labels = this.tableSum.map((_, i) => i);
    }

    this.chart?.update();
  }
}
