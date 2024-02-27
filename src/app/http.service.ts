import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Player, putItem } from './interfaces';
import { Observable} from 'rxjs';

import { StateService } from './state.service';

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

  pushGame(item: putItem): Observable<null> {
    return this.http
      .put<null>(this.url + item.URL, item.content, this.httpOptions)
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
