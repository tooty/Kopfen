import { createAction, props } from '@ngrx/store'
import { Game } from '../interfaces'


export const storeGame = createAction('[Game Effect] Store Game',
  props<Game>()
)
export const loadIndexDbGame = createAction('[App] Load IndexDb Game')
export const loadIndexDBGameSuccess = createAction(
  '[App] Load Game Success', props<{ payload: Game[] }>()
)
export const resetLocal = createAction('[Game Component] ResetLocal')
export const validateGame = createAction('[Game Component] Validate Game', props<Game>())
export const httpSyncGame = createAction('[App] Http Sync Game')
export const gameSynced = createAction('[Game Effect] Game Synced', props<Game>())
export const pullGames = createAction('[Player Component] Pull Games from Server', props<{ start: number, end: number }>())
export const serverRespondGames = createAction('[Game Effect] Pull Response Server', props<{ payload: Game[] }>())
