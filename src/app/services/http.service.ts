import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Game, Player } from '../interfaces';
import {throwError, Observable, catchError, pipe, tap } from 'rxjs';

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
    const url: string = this.url + ("time" in item ? "/games" : "/player")
    console.log(url, item)
    return this.http
      .put<HttpEvent<T>>(url, item, this.httpOptions)
      .pipe(
        catchError((error: any) => {
          // Handle errors here
          console.error('An error occurred:', error);
          // You can throw the error again if needed
          return throwError(error);
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

    return this.http.get<Game[]>(`${this.url}/game`, {
      responseType: 'json',
      params: params,
    });
  }
}
