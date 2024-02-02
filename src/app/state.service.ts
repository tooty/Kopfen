import { Injectable } from '@angular/core';
import { Player,Game } from './interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private players = new BehaviorSubject<Player[]>([])
  private games = new BehaviorSubject<Game[]>([])
  private coastTable = new BehaviorSubject<number[][]>([])
  private sumTable = new BehaviorSubject<number[][]>([])

  players$ = this.players.asObservable()
  games$ = this.games.asObservable()
  coastTable$ = this.coastTable.asObservable()
  sumTable$ = this.sumTable.asObservable()
  db: IDBDatabase | null = null

  constructor() {
    this.initDB()
  }

  initDB(){
    let request = indexedDB.open('appState',2)

    request.onerror = (ev) => console.error(ev.target)
    request.onupgradeneeded = () => {
      this.db = request.result
      if (!this.db.objectStoreNames.contains('games')) {
        this.db.createObjectStore('games', { keyPath: 'time', autoIncrement: true });
      }
      if (!this.db.objectStoreNames.contains('players')) {
        this.db.createObjectStore('players', { keyPath: 'id', autoIncrement: true });
      }
    }

    request.onsuccess = () => {
      this.db = request.result
      this.readIDB()
    }

  }

  readIDB(){
    if (this.db == undefined) {
      console.error("no db")
      return
    }

    const trans = this.db.transaction(["players","games"])
    const osPlayers = trans.objectStore("players")
    const reqPlayers = osPlayers.getAll()

    reqPlayers.onsuccess = (event) => {
      this.players.next(reqPlayers.result)
    }

    const osGames = trans.objectStore("games")
    const reqGames = osGames.getAll()

    reqGames.onsuccess = (event) => {
      this.games.next(reqGames.result)
      this.rebuildCostTable()
    }

  }

  rebuildCostTable(){
    let table: number[][] = []
    const games = this.games.value
    for (let i = 0;i < games.length; i++) {
      table[i] = this.players.value.map(p => this.getCost(games[i], p)!)
    }
    this.coastTable.next(table)
    this.rebuildsumTable()
  }

  rebuildsumTable(){
    let table: number[][] = []
    let prvious: number[]
    table = this.coastTable.value.map((x,index,t) => {
      if (index == 0 ) {
        prvious = x
        return prvious
      }
      //Vector prvious, x)
      prvious = prvious.map((y,j)=> y + x[j])
      return prvious
    })
    this.sumTable.next(table)
  }

  reset(){
    indexedDB.deleteDatabase("appState")
    this.initDB()
    this.games.next([])
    this.players.next([])
  }

  addPlayer (newPlayer: Player){
    let buff = this.players.getValue()
    if (newPlayer.name.length < 1) {
      console.error("Name to short")
      return
    }
    if (buff.filter(p => p.name == newPlayer.name).length != 0) {
      console.error("Name already used")
      return
    }

    buff.push(newPlayer)

    if (this.db != null) {
      const trans = this.db.transaction("players", "readwrite")
      trans.objectStore("players").add(newPlayer)
    }else{
      console.error("no IDBDatabase")
    }



    this.players.next(buff)
  }

  getCost (game: Game, player: Player): number|null {
    let winnerCount = 0

    game.involved.forEach(p => {
      if (p.winner){
        winnerCount++
      }
    })

    const serchedPlayer = game.involved.find(x => x.playerID == player.id)
    if (serchedPlayer == undefined) {
      return null
    }

    if (serchedPlayer.winner) {
      if (winnerCount == 1) {
        return game.cost * 3
      }
      return game.cost
    }
    else {
      if (winnerCount == 3) {
        return -game.cost * 3
      }
        return -game.cost
    }
  }

  addGame (newGame: Game){
    let buff = this.games.getValue()
    buff.push(newGame)

    if (this.db != null) {
      const trans = this.db.transaction("games", "readwrite")
      trans.objectStore("games").add(newGame)
    }else{
      console.error("no IDBDatabase")
    }

    this.games.next(buff)
    this.rebuildCostTable()
  }
}
