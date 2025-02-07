import { APP_INITIALIZER, ApplicationConfig, isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient } from '@angular/common/http';
import { provideStore, provideState } from '@ngrx/store';
import { playerReducer } from './store/player.reducer';
import { provideEffects } from '@ngrx/effects';
import { gameReducer } from './store/game.reducer';
import { PlayersEffects } from './store/player.effects';
import { IndexDBService } from './services/index-db.service';
import { GameEffects } from './store/game.effects';
import { tableReducer, tableSumReducer } from './store/table.reducer';
import { TableEffects } from './store/table.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (indexDBService: IndexDBService) => () =>
        indexDBService.initDB(),
      deps: [IndexDBService],
      multi: true,
    },
    provideHttpClient(),
    provideStore(),
    provideState({ name: 'players', reducer: playerReducer }),
    provideState({ name: 'game', reducer: gameReducer }),
    provideState({ name: 'table', reducer: tableReducer }),
    provideState({ name: 'sumTable', reducer: tableSumReducer }),
    provideEffects(PlayersEffects),
    provideEffects(GameEffects),
    provideEffects(TableEffects),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
    provideEffects(),
  ],
};
