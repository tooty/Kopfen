import {createReducer, on } from '@ngrx/store'
import * as ga from './game.action'
import {Game} from '../interfaces'

export const initialState: ReadonlyArray<Game> = []

export const gameReducer = createReducer(
  initialState,

  on(ga.storeStore, (state, g) => [...state, g]),
  on(ga.resetLocal, () => initialState),
  on(ga.loadIndexDBGameSuccess, (_,p) => p.payload),
  on(ga.gameSynced, (state,p) => {
    let copy = {...p}
    copy.synced = !copy.synced
    return state.map(x=> x.time === p.time ? x:copy)
  }),
)
