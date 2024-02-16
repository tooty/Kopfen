import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Player } from './interfaces';
import {
  Observable,
  of,
  mergeMap,
  Subject,
  catchError,
  tap,
  throwError,
  delay,
  timeout,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private url = 'api';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
  private gameQueue = new Subject<Game>();
  private retryLimit = 1000; // Set a retry limit
  private retryCounts: Map<Game, number> = new Map(); // Track retry counts for each game

  constructor(private http: HttpClient) {
    const games: Game[] = JSON.parse(localStorage.getItem('gameQueue') ?? '[]');

    this.gameQueue
      .pipe(
        mergeMap((game: Game) =>
          this.putGame(game).pipe(
            catchError((err) => {
              const retries = this.retryCounts.get(game) || 0;
              if (retries < this.retryLimit) {
                console.log(
                  `Retrying game update: ${game.time}. Attempt ${retries + 1}`
                );
                this.retryCounts.set(game, retries + 1);
                new Promise((res) => setTimeout(res, 10000)).then(
                  () => this.gameQueue.next(game) // Requeue the game
                );
                return of(null); // Prevent further error propagation for this attempt
              } else {
                return throwError(
                  () => new Error(`Failed to update game: ${game.time}`)
                ); // Propagate error
              }
            })
          )
        )
      )
      .subscribe();

    games.forEach((game) => this.gameQueue.next(game));
  }

  pushGame(game: Game) {
    if (!this.retryCounts.has(game)) {
      this.retryCounts.set(game, 0); // Initialize retry count for new games
    }
    this.gameQueue.next(game);
    console.log('Game queued');
  }

  putGame(game: Game): Observable<Object> {
    return this.http.put(`${this.url}/game`, game, this.httpOptions).pipe(
      catchError((err) => {
        console.error(`Error updating game: ${game.time}`, err);
        return throwError(() => err); // Propagate error for handling in mergeMap's catchError
      })
    );
  }

  putPlayer(player: Player) {
    const result = this.http.put(
      this.url + '/player',
      player,
      this.httpOptions
    );
    result.subscribe((next) => console.log(next));
  }

  getGames(start: number, end: number): Observable<HttpResponse<Game[]>> {
    let params = new HttpParams()
      .set('start', start.toString())
      .set('end', end.toString());
    return this.http.get<HttpResponse<Game[]>>(`${this.url}/game`, {
      responseType: 'json',
      params: params,
    });
  }

  // putPlayer and getGames methods remain unchanged
}
