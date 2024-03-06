import { Injectable } from '@angular/core'
import { IndexDBService } from '../services/index-db.service'
import { from, catchError, map, of, withLatestFrom, mergeMap, Observable } from 'rxjs'
import { exhaustMap} from 'rxjs'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { Store, select } from '@ngrx/store'
import { Game } from '../interfaces'
import * as GameAction from './game.action'
import { HttpService } from '../services/http.service'
import { HttpRequest } from '@angular/common/http'

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
        mergeMap((games) => [
          GameAction.loadIndexDBGameSuccess({ payload: games }),
          GameAction.httpSyncGame(),
        ]),
        catchError((e) => of({ type: '[App] Load Game Error', e }))
      )
    )
  ))

  setIndexDbGame$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.storeGame),
    exhaustMap((p) => from(this.indexDbService.saveGame(p))
      .pipe(
        map(() => GameAction.httpSyncGame()),
        catchError((e) => of({ type: '[indexDBService] Save Game Error', e }))
      )
    )
  ))

  resetIndexDb$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.resetLocal),
    exhaustMap(() => from(this.indexDbService.reset())
      .pipe(
        map(() => ({ type: '[indexDBService] Reset IndexDB Success' }))
        , catchError((e) => of({ type: '[indexDBService] Reset IndexDB Error', e }))
      )
    )
  ))

  validateGame$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.validateGame),
    withLatestFrom(this.store.pipe(select('game'))),
    exhaustMap((newAndCurr) => this.gameIsValid(newAndCurr[0], newAndCurr[1])
      .pipe(
        map(() => GameAction.storeGame(newAndCurr[0])),
        catchError((reason) => of({ type: '[Game Effect] Game Not Valid', reason }))
      )
    )
  ))

  httpPushGames$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.httpSyncGame),
    withLatestFrom(this.store.pipe(select('game'))),
    exhaustMap((ps) => this.mergeMapPushGames(ps[1])
      .pipe(
        map((p) => GameAction.gameSynced(p)),
        catchError((reason) => of({ type: '[Game Effect] Http Put Failed', reason }))
      )
    )
  ))

  pullGames$ = createEffect(() => this.actions$.pipe(
    ofType(GameAction.pullGames),
    exhaustMap((scope) => from(this.httpService.getGames(scope.start, scope.end)
      .pipe(
        mergeMap((games) => of(...games)),
        map((game)=> GameAction.storeGame(game)),
        catchError((e) => of({ type: '[Http Service] Pull Games Error', e }))
      )
    )
    )
  ))

  mergeMapPushGames(games: Game[]): Observable<Game> {
    //Make push Request for all games and return
    return from(games.filter(x => x.synced == false)).pipe(
      mergeMap((g) => this.httpService.pushItem({ content: g, URL: '/game' }).pipe(
        catchError((e) => e), map(() => g)))
    )
  }



  gameIsValid(p: Game, state: Game[]): Observable<boolean> {
    return of(true)
  }

}
