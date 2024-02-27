import {createReducer, on } from '@ngrx/store'
import * as pa from './player.action'
import {Player} from './interfaces'

export const initialState: ReadonlyArray<Player> = []

export const playerReducer = createReducer(
  initialState,

  on(pa.playerValidated, (state, p) => [...state, p]),

  on(pa.resetLocal, () => initialState),
  on(pa.loadIndexDBPlayersSuccess, (_,p) => p.payload)
)
