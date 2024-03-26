import { Injectable } from '@angular/core'
import { IndexDBService } from '../services/index-db.service'
import {tap, from, catchError, map, of, withLatestFrom, mergeMap, Observable, concatMap } from 'rxjs'
import { exhaustMap } from 'rxjs'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { Store, select } from '@ngrx/store'
import { Game } from '../interfaces'
import * as GameAction from './game.action'
import * as PlayerActin from './player.action'
import { HttpService } from '../services/http.service'
import { regenTable } from './table.action'

@Injectable({
  providedIn: 'root',
})

export class GameEffects {

  constructor(
    private actions$: Actions,
    private indexDbService: IndexDBService,
    private httpService: HttpService,
    private store: Store<{ game: Game[] }>
  ) { }

  loadIndexDbGame$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.loadIndexDbGame),
    exhaustMap(() => from(this.indexDbService.readGames())
      .pipe(
        mergeMap((games) => from([
          GameAction.loadIndexDBGameSuccess({ payload: games }),
          GameAction.httpSyncGame(),
          regenTable()
        ])),
        catchError((e) => of({ type: '[App] Load Game Error', e }))
      )
    )
  ))

  setIndexDbGame$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.storeIndexDB),
    exhaustMap((g) => from(this.indexDbService.saveGame(g))
      .pipe(
        mergeMap(() => from([
          GameAction.storeStore(g),
          GameAction.httpSyncGame(),
          regenTable()
        ])),
        catchError((e) => of({ type: '[indexDBService] Save Game Error', e }))
      )
    )
  ))

  resetIndexDb$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.resetLocalGames),
    exhaustMap(() => from(this.indexDbService.reset())
      .pipe(
        map(() => regenTable())
        , catchError((e) => of({ type: '[indexDBService] Reset IndexDB Error', e }))
      )
    )
  ))

  validateGame$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.validateGame),
    withLatestFrom(this.store.pipe(select('game'))),
    exhaustMap((newAndCurr) => this.gameIsValid(newAndCurr[0], newAndCurr[1])
      .pipe(
        map((g) => GameAction.storeIndexDB(g)),
        catchError((e) => of({ type: '[Game Effect] Game Not Valid', e }))
      )
    )
  ))

  httpPushGames$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.httpSyncGame),
    withLatestFrom(this.store.pipe(select('game'))),
    exhaustMap((ps) => this.mergeMapPushGames(ps[1])
      .pipe(
        map((p) => GameAction.gameSynced(p)),
        catchError((e) => of({ type: '[Game Effect] Http Put Failed', e }))
      )
    )
  ))

  mergeMapPushGames(games: Game[]): Observable<Game> {
    //Make push Request for all games and return
    return from(games.filter(x => x.synced == false)).pipe(
      mergeMap((g) => this.httpService.putItem(g).pipe(
        catchError((e) => e), map(() => g)))
    )
  }

  pullGamesHttp$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.pullGamesHttp),
    exhaustMap((scope) => from(this.httpService.getGames(scope.start, scope.end)
      .pipe(
        concatMap((games) => from(games)),
        map((game) => GameAction.handlePullResponse(game)),
        catchError((e) => of({ type: '[Game Effects] Pull Games Error', e }))
      )
    )
    )
  ))

  handlePullResponse$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.handlePullResponse),
    concatMap((game) => from(this.indexDbService.saveGame(game))
      .pipe(
        mergeMap(() => from([
          PlayerActin.newHttpPulledGame({ payload: game.involved.map((x)=>x.playerID) }),
          GameAction.storeStore(game),
          regenTable()
        ])),
        catchError((e) => of({ type: '[indexDBService] Save Game Error', e }))
      )
    )
  ))



  gameIsValid(game: Game, state: Game[]): Observable<Game> {
    return of(game)
  }

}
