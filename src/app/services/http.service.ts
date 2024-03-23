import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Player } from '../interfaces';
import { Observable,catchError,pipe,tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class HttpService {
  private url = 'api';
  private httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };

  constructor(private http: HttpClient) {
  }

  putItem<T extends Game | Player>(item: Game | Player): Observable<HttpEvent<T>> {
    const url: string = "time" in item ? "/games" : "/player"
    return this.http
      .put<HttpEvent<T>>(this.url + url, item, this.httpOptions)
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

    return this.http.get<Game[]>(`${this.url}/game`, {
      responseType: 'json',
      params: params,
    });
  }
}
