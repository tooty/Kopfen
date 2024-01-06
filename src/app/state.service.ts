import { Injectable } from '@angular/core';
import { Player } from './player';
import { Game } from './game';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private players = new BehaviorSubject<Player[]>([])
  private games = new BehaviorSubject<Game[]>([])
  players$ = this.players.asObservable()
  games$ = this.games.asObservable()

  addPlayer (newPlayer: Player){
    let buff = this.players.getValue()
    if (buff.filter(p => p.name == newPlayer.name).length != 0) {
      console.error("Name already used")
      return
    }
    buff.push(newPlayer)
    window.localStorage.setItem("players", JSON.stringify(buff))
    this.players.next(buff)
  }

  addGame (newGame: Game){
    let buff = this.games.getValue()
    buff.push(newGame)
    window.localStorage.setItem("games", JSON.stringify(buff))
    this.games.next(buff)
  }

  gameSum(): {p: Player, sum: number[]}[] {
    let ret: {p: Player, sum: number[]}[] = []
    this.players.value.forEach(p => {
      let costs: number[] = this.games.value.map(g => {
        let gamecost = g.players.find(pf => pf.id == p.id)?.cost ?? 0
        return gamecost
      })
      let a = 0
      let accumulate = costs.map(n => a+=n)
      ret.push({p: p, sum: accumulate})
    })
    console.log(JSON.stringify(ret))
    return ret
  }

  constructor() {
    let storagePlayers = window.localStorage.getItem("players")
    let storageGames = window.localStorage.getItem("games")
    if (storagePlayers != null) {
      let players: Player[] = JSON.parse(storagePlayers)
      players.forEach(p => this.addPlayer(p))
    }

    if (storageGames != null) {
      let games: Game[] = JSON.parse(storageGames)
      games.forEach(g => this.addGame(g))
    }
  }
}
