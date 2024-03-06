import { Injectable } from '@angular/core';
import { Game, Player } from '../interfaces';
import { BehaviorSubject, Observable, Subject, switchMap, of } from 'rxjs';
import { Store } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  public costTable = new BehaviorSubject<number[][]>([])
  public sumTable = new BehaviorSubject<number[][]>([])
  games$: Observable<Game[]>
  players$: Observable<Player[]>
  players: Player[] = []
  games: Game[] = []
  regen = new Subject<void>()

  constructor(
    private store: Store<{ players: Player[], game: Game[] }>,
  ) {
    this.players$ = this.store.select('players')
    this.games$ = this.store.select('game')
    this.players$.subscribe(next => {
      this.players = next
      this.regen.next()
    })
    this.games$.subscribe(next => {
      this.games = next
      this.regen.next()
    })

    this.regen.pipe(switchMap(()=>{
      this.genTeable()
      this.genSum()
      return of(null)
  })).subscribe()
  }

  gameCost(game: Game, player: Player): number | null {
    let winnerCount = 0;

    game.involved.forEach((p) => {
      if (p.winner) {
        winnerCount++;
      }
    });

    const serchedPlayer = game.involved.find((x) => x.playerID == player.id);
    if (serchedPlayer == undefined) {
      return null;
    }

    if (serchedPlayer.winner) {
      if (winnerCount == 1) {
        return game.cost * 3;
      }
      return game.cost;
    } else {
      if (winnerCount == 3) {
        return -game.cost * 3;
      }
      return -game.cost;
    }
  }

  getObservables(): [Observable<number[][]>, Observable<number[][]>] {
    return [this.costTable.asObservable(), this.sumTable.asObservable()]
  }

  regenTabeles(){
    this.genTeable()
    this.genSum()
  }

  genTeable() {
    //rows,first~games, cols,second~player
    let table: number[][] = [];
    for (let i = 0; i < this.games.length; i++) {
      table[i] = this.players.map((p) => this.gameCost(this.games[i], p)!);
    }
    this.costTable.next(table)
  }

  genSum() {
    let table: number[][] = [];
    let prvious: number[];
    table = this.costTable.value.map((x, index: number) => {
      if (index == 0) {
        prvious = x;
        return prvious;
      }
      //vector prvious, x)
      prvious = prvious.map((y, j) => y + x[j]);
      return prvious;
    });
    this.sumTable.next(table)
  }
}
