import { Routes } from '@angular/router';
import {GameComponent} from './game/game.component';
import { TableComponent} from './table/table.component';
import { PlayersComponent } from './players/players.component';
import {GraphComponent} from './graph/graph.component';

export const routes: Routes = [
  { path: '', component: TableComponent},
  { path: 'players', component: PlayersComponent},
  { path: 'game', component: GameComponent},
  { path: 'graph', component: GraphComponent}
];
