import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Store } from '@ngrx/store';
import { pullGamesHttp } from './store/game.action';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  socket$: WebSocketSubject<any>;

  constructor(
    private store: Store<{}>
  ) {
    this.socket$ = webSocket('ws://${window.location.host}/ws');
    this.socket$.subscribe(() => {
      this.store.dispatch(pullGamesHttp({ start: Date.now() - 1000 * 60 * 6 * 60, end: Date.now() }));
    })
  }
}
