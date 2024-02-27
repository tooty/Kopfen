import {createReducer, on } from '@ngrx/store'
import * as pa from './player.action'
import {Player} from './interfaces'

export const initialState: ReadonlyArray<Player> = []

export const playerReducer = createReducer(
  initialState,

  on(pa.storePlayer, (state, p) => [...state, p]),
  on(pa.resetLocal, () => initialState),
  on(pa.loadIndexDBPlayersSuccess, (_,p) => p.payload),
  on(pa.playerSynced, (state,p) => {
    let copy = {...p}
    copy.synced = !copy.synced
    return state.map(x=> x.name === p.name ? x:copy)
  }),
)
