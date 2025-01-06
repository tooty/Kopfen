import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor() { }

  private socket$!: WebSocketSubject<any>;

  connect(url: string) {
    this.socket$ = webSocket(url);

    this.socket$.subscribe(
      (msg) => console.log('message received: ' + msg),
      (err) => console.error(err),
      () => console.log('complete')
    );
  }
}
