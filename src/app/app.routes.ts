import { Routes } from '@angular/router';
import {GameComponent} from './game/game.component';
import { OverviewComponent} from './overview/overview.component';
import { PlayerOverviewComponent } from './player-overview/player-overview.component';

export const routes: Routes = [
  { path: '', component: OverviewComponent},
  { path: 'players', component: PlayerOverviewComponent},
  { path: 'game', component: GameComponent}
];
