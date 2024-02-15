import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Game, Player} from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private url = 'api'
  private httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  }

  constructor(
    private http: HttpClient

  ){}

  putGame(game: Game){
    console.log(game)
    const result = this.http.put(this.url + "/game", game, this.httpOptions)
    result.subscribe((next)=> console.log(next))
  }
  putPlayer(player: Player){
    console.log(player)
    const result = this.http.put(this.url + "/player", player, this.httpOptions)
    result.subscribe((next) => console.log(next))
  }

  getGames(start: number, end: number) {
    var myparams = new HttpParams()
    myparams = myparams.append("start", start)
    myparams = myparams.append("end", end)
    let result = this.http.get(this.url + "/game", {responseType: 'json', params: myparams})
    result.subscribe((next) => console.log("request arived:",next))
  }
}
