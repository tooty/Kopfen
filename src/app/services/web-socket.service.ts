import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Store, StoreModule } from '@ngrx/store';
import {pullGamesHttp} from '../store/game.action'
import { Game, Player } from '../interfaces';
import {Observable, retryWhen,switchMap, pipe, delay,of ,take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {


  private socket: WebSocketSubject<any>;
  public socket$: Observable<WebSocketSubject<any>>;

  constructor(
  ) {
    this.socket = webSocket('wss://' + window.location.host + '/ws');
    this.socket$ = this.socket.asObservable();
    this.socket.pipe(
      retryWhen(errors => errors.pipe(
        switchMap((error, index) => {
            const delayTime = Math.pow(2, index) * 1000; // Exponential backoff
            console.error(`WebSocket disconnected. Retrying in ${delayTime}ms...`);
            return of(error).pipe(delay(delayTime));
          }),
      )))
  }

  reconnect() {
    this.socket = webSocket('wss://' + window.location.host + '/ws');
    this.socket$ = this.socket.asObservable();
  }
}
