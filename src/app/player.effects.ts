import { Injectable } from '@angular/core'
import {IndexDBService} from './index-db.service'
import {from,catchError,map,of, withLatestFrom, mergeMap, Observable, throwError } from 'rxjs'
import {tap,exhaustMap } from 'rxjs'
import { createEffect,Actions, ofType } from '@ngrx/effects'
import { Store,select } from '@ngrx/store'
import { Player } from './interfaces'
import * as pa from './player.action'

@Injectable({
  providedIn: 'root',
})

export class PlayersEffects {

  constructor(
    private actions$: Actions,
    private indexDbService: IndexDBService,
    private store: Store<{players: Player[]}>
  ){}

    loadIndexDbPlayers$ = createEffect(() =>this.actions$.pipe(
      ofType(pa.loadIndexDbPlayers),
      exhaustMap(() => from(this.indexDbService.readPlayers())
                 .pipe(
                   map(players => pa.loadIndexDBPlayersSuccess({payload:  players}))
                  ,catchError((e)=> of({ type: '[App] Load Players Error',e }))
                 )
      )
    ))

    setIndexDbPlayers$ = createEffect(() =>this.actions$.pipe(
      tap((e)=>console.log(e)),
      ofType(pa.playerValidated),
      exhaustMap((p) => from(this.indexDbService.savePlayer(p))
                 .pipe(
                   map(() => ({type: '[indexDBService] Set Players Success'}))
                  ,catchError(()=> of({ type: '[indexDBService] Save Player Error' }))
                 )
      )
    ))

    resetIndexDb$ = createEffect(() =>this.actions$.pipe(
      ofType(pa.resetLocal),
      exhaustMap(() => from(this.indexDbService.reset())
                 .pipe(
                   map(() => ({type: '[indexDBService] Reset IndexDB Success'}))
                  ,catchError(()=> of({ type: '[indexDBService] Reset IndexDB Error' }))
                 )
      )
    ))

    validatePlayer$ = createEffect(()=> this.actions$.pipe(
      ofType(pa.validatePlayer),
      withLatestFrom(this.store.pipe(select('players'))),
      mergeMap((newAndCurr)=>this.playerIsValid(newAndCurr[0],newAndCurr[1])
               .pipe(
                tap((e)=>console.log("tap",e))
               )
               .pipe(
                 () => of(pa.playerValidated(newAndCurr[0])),
                 catchError(()=>of({type: '[Players Effect] Player Not Valid' }))
                )
              )

    ))

    playerIsValid(p:Player, state: Player[]):Observable<boolean> {
        return throwError(()=>"to short")
      console.log("here")
      console.log("there",p,state)
      if (p.name.length <= 3)
        return throwError(()=>"to short")
      if (state.find(x=> x.id == p.id)!= undefined)
        return throwError(()=>"id used")
      if (state.find(x=> x.name == p.name) != undefined)
        return throwError(()=>"name used")
      return of(true)
    }
}
