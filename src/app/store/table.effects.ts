import { Injectable } from '@angular/core'
import { Store, select } from '@ngrx/store'
import { tap, from, exhaustMap, catchError, map, of, withLatestFrom, mergeMap, Observable, concatMap } from 'rxjs'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { regenTable, storeTable, regenTableSum, storeSumTable } from './table.action'
import { Game, Player } from '../interfaces'

@Injectable({
  providedIn: 'root',
})

export class TableEffects {

  constructor(
    private actions$: Actions,
    private store: Store<{ game: Game[], players: Player[] }>
  ) { }

  regenTabel$ = createEffect(() => this.actions$.pipe(
    ofType(regenTable),
    withLatestFrom(this.store.pipe(select('game'))),
    withLatestFrom(this.store.pipe(select('players'))),
    exhaustMap((data) => this.genTabel(data[0][1], data[1])
      .pipe(
        mergeMap((t) => [
          regenTableSum({ table: t }),
          storeTable({ table: t })
        ]),
        catchError((e) => of({ type: '[Table Effects] Generting Table', e }))
      )
    )))

  regenSumTabel$ = createEffect(() => this.actions$.pipe(
    ofType(regenTableSum),
    exhaustMap((data) => this.genSum(data.table)
      .pipe(
        map((t) => storeSumTable({ table: t }))
        , catchError((e) => of({ type: '[Table Effects] Generting Sum Table', e }))
      )
    )))

  genTabel(games: Game[], players: Player[]): Observable<number[][]> {
    let table: number[][] = [];
    games.sort((a,b)=>a.time - b.time)
    for (let i = 0; i < games.length; i++) {
      table[i] = players.map((p) => this.gameCost(games[i], p)!);
    }
    return of(table)
  }

  genSum(costTable: number[][]): Observable<number[][]> {
    let table: number[][] = [];
    let prvious: number[];
    table = costTable.map((x, index: number) => {
      if (index == 0) {
        prvious = x;
        return prvious;
      }
      //vector prvious, x)
      prvious = prvious.map((y, j) => y + x[j]);
      return prvious;
    });
    return of(table)
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
}
