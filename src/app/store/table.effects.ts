import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  tap,
  from,
  exhaustMap,
  catchError,
  map,
  of,
  withLatestFrom,
  mergeMap,
  Observable,
  concatMap,
} from 'rxjs';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import {
  regenTable,
  storeTable,
  regenTableSum,
  storeSumTable,
} from './table.action';
import { Game, Player } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class TableEffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ game: Game[]; players: Player[] }>,
  ) {}

  regenTable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(regenTable),
      withLatestFrom(this.store.pipe(select('game'))),
      withLatestFrom(this.store.pipe(select('players'))),
      exhaustMap((data) =>
        this.genTable(data[0][1], data[1]).pipe(
          mergeMap((t) => [
            regenTableSum({ table: t }),
            storeTable({ table: t }),
          ]),
          catchError((e) =>
            of({ type: '[Table Effects] Generating Table', e }),
          ),
        ),
      ),
    ),
  );

  regenSumTable$ = createEffect(() =>
    this.actions$.pipe(
      ofType(regenTableSum),
      exhaustMap((data) =>
        this.genSum(data.table).pipe(
          map((t) => storeSumTable({ table: t })),
          catchError((e) =>
            of({ type: '[Table Effects] Generating Sum Table', e }),
          ),
        ),
      ),
    ),
  );

  genTable(games: Game[], players: Player[]): Observable<number[][]> {
    let table: number[][] = [];
    let games_copy = [...games];
    games_copy.sort((a, b) => a.time - b.time);
    for (let i = 0; i < games_copy.length; i++) {
      table[i] = players.map((p) => this.gameCost(games_copy[i], p)!);
    }
    return of(table);
  }

  genSum(costTable: number[][]): Observable<number[][]> {
    let table: number[][] = [];
    let previous: number[];
    table = costTable.map((x, index: number) => {
      if (index == 0) {
        previous = x;
        return previous;
      }
      previous = previous.map((y, j) => y + x[j]);
      return previous;
    });
    return of(table);
  }

  gameCost(game: Game, player: Player): number | null {
    let winnerCount = 0;

    game.involved.forEach((p) => {
      if (p.winner) {
        winnerCount++;
      }
    });

    const searchedPlayer = game.involved.find((x) => x.playerID == player.id);
    if (searchedPlayer == undefined) {
      return null;
    }

    if (searchedPlayer.winner) {
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
