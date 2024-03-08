import { Injectable } from '@angular/core'
import { IndexDBService } from '../services/index-db.service'
import { from, catchError, map, of, withLatestFrom, mergeMap, Observable, throwError} from 'rxjs'
import { tap, exhaustMap } from 'rxjs'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { Store, select } from '@ngrx/store'
import { Player } from '../interfaces'
import * as PlayerAction from './player.action'
import { HttpService } from '../services/http.service'
import { TypedAction } from '@ngrx/store/src/models'

@Injectable({
  providedIn: 'root',
})

export class PlayersEffects {

  constructor(
    private actions$: Actions,
    private indexDbService: IndexDBService,
    private httpService: HttpService,
    private store: Store<{ players: Player[] }>
  ) { }

  loadIndexDbPlayers$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.loadIndexDbPlayers),
    exhaustMap(() => from(this.indexDbService.readPlayers())
      .pipe(
        mergeMap((players) => from([
          PlayerAction.loadIndexDBPlayersSuccess({ payload: players }),
          PlayerAction.httpSyncPlayers(),
        ])),
        catchError((e) => of({ type: '[App] Load Players Error', e }))
      )
    )
  ))

  setIndexDbPlayers$ = createEffect(() => this.actions$.pipe(
    tap((e) => console.log(e)),
    ofType(PlayerAction.storePlayer),
    exhaustMap((p) => from(this.indexDbService.savePlayer(p))
      .pipe(
        map(() => PlayerAction.httpSyncPlayers()),
        catchError((e) => of({ type: '[indexDBService] Save Player Error', e }))
      )
    )
  ))

  resetIndexDb$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.resetLocal),
    exhaustMap(() => from(this.indexDbService.reset())
      .pipe(
        map(() => ({ type: '[indexDBService] Reset IndexDB Success' }))
        , catchError((e) => of({ type: '[indexDBService] Reset IndexDB Error', e }))
      )
    )
  ))

  validatePlayer$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.validatePlayer),
    withLatestFrom(this.store.pipe(select('players'))),
    exhaustMap((newAndCurr) => this.playerIsValid(newAndCurr[0], newAndCurr[1])
      .pipe(
        map(() => PlayerAction.storePlayer(newAndCurr[0])),
        catchError((reason) => of({ type: '[Players Effect] Player Not Valid', reason }))
      )
    )
  ))

  httpSyncPlayers$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.httpSyncPlayers),
    withLatestFrom(this.store.pipe(select('players'))),
    exhaustMap((ps) => this.mergeMapSyncPlayers(ps[1])
      .pipe(
        map((p) => PlayerAction.playerSynced(p)),
        catchError((reason) => of({ type: '[Players Effect] Http Put Failed', reason }))
      )
    )
  ))

  pullPlayerHttp$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.pullPlayerHttp),
    mergeMap(id => this.httpService.getPlayer(id.toString())
      .pipe(
        map((p) => PlayerAction.storePlayer(p)),
        catchError((reason) => of({ type: '[Players Effect] Http Pull Failed', reason }))
      )
    ))
  )


  newPulledGame = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.newHttpPulledGame),
    withLatestFrom(this.store.pipe(select('players'))),
    mergeMap((idAndState) => this.playerExists(idAndState[0].payload, idAndState[1])
      .pipe(
        catchError((reason) => of({ type: '[Players Effect] Http Put Failed', reason }))
      )
    )
  ))

  playerExists(ids: String[], state: Player[]): Observable<TypedAction<string>> {
    return from(ids).pipe(mergeMap(id => {
      if (state.find(x => x.id == id) == undefined) {
        return of(PlayerAction.pullPlayerHttp(id))
      }
      return of({ type: '[Player Effect] Player Exists' })
    }))
  }


  mergeMapSyncPlayers(ps: Player[]): Observable<Player> {
    return from(ps.filter(x => x.synced == false)).pipe(
      mergeMap((p) => this.httpService.pushItem({ content: p, URL: '/player' }).pipe(
        catchError((e) => e), map(() => p)))
    )
  }

  playerIsValid(p: Player, state: Player[]): Observable<boolean> {
    if (p.name.length <= 3)
      return throwError(() => "to short")
    if (state.find(x => x.id == p.id) != undefined)
      return throwError(() => "id used")
    if (state.find(x => x.name == p.name) != undefined)
      return throwError(() => "name used")
    return of(true)
  }
}
