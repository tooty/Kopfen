import { APP_INITIALIZER, ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import {provideHttpClient} from '@angular/common/http';
import { provideStore,provideState } from '@ngrx/store';
import { playerReducer } from './player.reducer';
import { provideEffects } from '@ngrx/effects';
import { PlayersEffects } from './player.effects';
import { IndexDBService } from './index-db.service';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (indexDBService: IndexDBService) => () => indexDBService.initDB(),
      deps: [IndexDBService],
      multi: true
    },
    provideHttpClient(),
    provideRouter(routes),
    provideStore(),
    provideState({ name: 'players', reducer: playerReducer }),
    provideEffects(PlayersEffects),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000',
    }),
    provideEffects()
],
};
