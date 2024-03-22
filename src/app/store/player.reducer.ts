import {createReducer, on } from '@ngrx/store'
import * as pa from './player.action'
import {Player} from '../interfaces'

export const initialState: ReadonlyArray<Player> = []

export const playerReducer = createReducer(
  initialState,

  on(pa.storePlayer, (state, p) => [...state, p]),
  on(pa.resetLocal, () => initialState),
  on(pa.addPlayersStore, (_,p) => p.payload),
  on(pa.replacePlayer, (state, p) => {
    const newState = state.filter(x=>x.name != p.name);
    return [...newState, p]
  }),
)
