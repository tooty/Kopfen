import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Player, putItem } from './interfaces';
import {
  Observable,
  of,
  mergeMap,
  tap,
  Subject,
  catchError,
  BehaviorSubject,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private url = 'api';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  private putQueue = new Subject<putItem>();

  constructor(private http: HttpClient) {
    this.putQueue.pipe(mergeMap((next) => this.putHandler(next))).subscribe();
  }

  pushGame(game: Game) {
    this.putQueue.next({ content: game, putURL: '/game' });
    console.log('Game queued');
  }

  pushPlayer(player: Player) {
    console.log('pushPlayer()');
    this.putQueue.next({ content: player, putURL: '/player' });
    console.log('player queued');
  }

  putHandler(item: putItem): Observable<Object | null> {
    return this.http
      .put(this.url + item.putURL, item.content, this.httpOptions)
      .pipe(
        catchError((err, caught) => {
          new Promise((res) => setTimeout(res, 5000)).then(() =>
            this.putQueue.next(item)
          );
          throw err;
        })
      );
  }

  getGames(
    start: number,
    end: number
  ): Observable<HttpResponse<{ g: Game[]; p: Player[] }>> {
    let params = new HttpParams()
      .set('start', start.toString())
      .set('end', end.toString());
    return this.http.get<HttpResponse<{ g: Game[]; p: Player[] }>>(
      `${this.url}/game`,
      {
        responseType: 'json',
        params: params,
      }
    );
  }
}
