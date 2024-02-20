import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Player, putItem } from './interfaces';
import {
  take,
  interval,
  BehaviorSubject,
  repeat,
  Observable,
  Subject,
  mergeMap,
  tap,
  delay,
  retry,
  finalize,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private url = 'api';
  private syncTime = new BehaviorSubject<number>(0);
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  private putQueue = new Subject<putItem>();

  constructor(private http: HttpClient) {
    interval(2000).pipe(
      repeat(),
      tap(() => {
        this.getGames(this.syncTime.value, Date.now());
        console.log('getGames', this.syncTime.value);
      }),
    ).subscribe();
    this.putQueue
      .pipe(mergeMap((next, index) => this.putHandler(next, index)))
      .subscribe();
    this.syncTime.next(Number(localStorage.getItem('syncTime')));
    this.syncTime.subscribe((next) =>
      localStorage.setItem('syncTime', this.syncTime.value.toString())
    );
  }

  pushGame(game: Game) {
    this.putQueue.next({ content: game, URL: '/game' });
  }

  pushPlayer(player: Player) {
    this.putQueue.next({ content: player, URL: '/player' });
  }

  putHandler(item: putItem, index: number): Observable<null> {
    return this.http
      .put<null>(this.url + item.URL, item.content, this.httpOptions)
      .pipe(
        tap(() => console.log('succcess', index)),
        retry({
          delay: 5000,
        })
      );
  }

  getPlayer(id: string): Observable<Player> {
    let params = new HttpParams().set('playerID', id);

    return this.http.get<Player>(`${this.url}/player`, {
      responseType: 'json',
      params: params,
    });
  }

  getGames(start: number, end: number): Observable<Game[]> {
    let params = new HttpParams()
      .set('start', start.toString())
      .set('end', end.toString());

    return this.http
      .get<Game[]>(`${this.url}/game`, {
        responseType: 'json',
        params: params,
      })
      .pipe(finalize(() => this.setTime(end)));
  }

  setTime(time: number) {
    this.syncTime.next(time);
  }
}
