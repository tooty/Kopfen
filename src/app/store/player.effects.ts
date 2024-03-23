import { Injectable } from '@angular/core'
import { IndexDBService } from '../services/index-db.service'
import { from, catchError, map, of, withLatestFrom, mergeMap, Observable, throwError, concatMap } from 'rxjs'
import { tap, exhaustMap } from 'rxjs'
import { createEffect, Actions, ofType } from '@ngrx/effects'
import { Store, select } from '@ngrx/store'
import { Player } from '../interfaces'
import * as PlayerAction from './player.action'
import { HttpService } from '../services/http.service'
import { TypedAction } from '@ngrx/store/src/models'
import { regenTable } from './table.action'

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
        mergeMap((players) => [
          PlayerAction.addPlayersStore({ payload: players }),
          PlayerAction.httpSyncPlayers(),
          regenTable()
        ]),
        catchError((e) => of({ type: '[App] Load Players Error', e }))
      )
    )
  ))

  setIndexDbPlayers$ = createEffect(() => this.actions$.pipe(
    tap((e) => console.log(e)),
    ofType(PlayerAction.storePlayer),
    concatMap((p) => from(this.indexDbService.savePlayer(p))
      .pipe(
        map(() => PlayerAction.httpSyncPlayers()),
        catchError((e) => of({ type: '[indexDBService] Save Player Error', e }))
      )
    )
  ))

  replacePlayer$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.replacePlayer),
    concatMap((p) => from(this.indexDbService.savePlayer(p))
      .pipe(
        map(() => ({ type: "[IndexDb] changed Key" })),
        catchError((e) => of({ type: '[http Service] changed Key error', e }))
      )
    )
  ))

  resetIndexDb$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.resetLocal),
    exhaustMap(() => from(this.indexDbService.reset())
      .pipe(
        mergeMap(() => [
          { type: '[indexDBService] Reset IndexDB Success' },
          regenTable()
        ])
        , catchError((e) => of({ type: '[indexDBService] Reset IndexDB Error', e }))
      )
    )
  ))

  validatePlayer$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.validatePlayer),
    withLatestFrom(this.store.pipe(select('players'))),
    mergeMap((newAndCurr) => this.playerIsValid(newAndCurr[0], newAndCurr[1])
      .pipe(
        mergeMap(() => [
          PlayerAction.storePlayer(newAndCurr[0]),
          regenTable()
        ]),
        catchError((reason) => of({ type: '[Players Effect] Player Not Valid', reason }))
      )
    )
  ))

  httpSyncPlayers$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.httpSyncPlayers),
    withLatestFrom(this.store.pipe(select('players'))),
    exhaustMap((ps) => this.mergeMapSyncPlayers(ps[1])
      .pipe(
        mergeMap((p) => [
          PlayerAction.replacePlayer(p),
          regenTable()
        ]),
        catchError((reason) => {
          console.log(reason)
          if (reason.error != null) {
            PlayerAction.replacePlayer(reason.error)
          }
          return of({ type: '[Players Effect] Http Put Failed', reason })
        })
      )
    )
  ))

  pullPlayerHttp$ = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.pullPlayerHttp),
    concatMap(id => this.httpService.getPlayer(id.payload)
      .pipe(
        map((p) => PlayerAction.validatePlayer(p)),
        catchError((reason) => of({ type: '[Players Effect] Http Pull Failed', reason }))
      )
    ))
  )


  newPulledGame = createEffect(() => this.actions$.pipe(
    ofType(PlayerAction.newHttpPulledGame),
    withLatestFrom(this.store.pipe(select('players'))),
    concatMap((idAndState) => this.playerExists(idAndState[0].payload, idAndState[1])
      .pipe(
        catchError((reason) => of({ type: '[Players Effect] Http Pull Failed', reason }))
      )
    )
  ))

  playerExists(ids: string[], state: Player[]): Observable<TypedAction<string>> {
    return from(ids).pipe(mergeMap(id => {
      if (state.find(x => x.id == id) == undefined) {
        return of(PlayerAction.pullPlayerHttp({ payload: id }))
      }
      return of({ type: '[Player Effect] Player Exists' })
    }))
  }


  mergeMapSyncPlayers(ps: Player[]): Observable<Player> {
    console.log(ps)
    return from(ps.filter(x => x.synced == false)).pipe(
      mergeMap((p) => this.httpService.putItem<Player>(p).pipe(
        tap((p)=>console.log(p)),
        catchError((e) => e), map(() => p)))
    )
  }

  playerIsValid(p: Player, state: Player[]): Observable<boolean> {
    p.name.replace(/\s+/g,"")
    if (p.name.length > 36)
      return throwError(() => "to long")
    if (p.name.length <= 3)
      return throwError(() => "to short")
    if (state.find(x => x.id == p.id) != undefined)
      return throwError(() => "id used")
    if (state.find(x => x.name == p.name) != undefined)
      return throwError(() => "name used")
    return of(true)
  }
}
