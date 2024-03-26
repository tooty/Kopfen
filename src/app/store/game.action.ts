import { createAction, props } from '@ngrx/store'
import { Game } from '../interfaces'


export const storeStore = createAction('[Game Effect] Store Game',
  props<Game>()
)
export const storeIndexDB = createAction('[Game Effect] add to IndexDB Game',
  props<Game>()
)
export const loadIndexDbGame = createAction('[App] Load IndexDb Game')
export const loadIndexDBGameSuccess = createAction(
  '[App] Load Game Success', props<{ payload: Game[] }>()
)
export const resetLocalGames = createAction('[Player Effect] ResetLocalGames')
export const validateGame = createAction('[App Component] Validate Game', props<Game>())
export const httpSyncGame = createAction('[App] Http Sync Game')
export const gameSynced = createAction('[Game Effect] Game Synced', props<Game>())
export const pullGamesHttp = createAction('[Player Component] Pull Games from Server', props<{ start: number, end: number }>())
export const handlePullResponse = createAction('[Game Effect] Pull Response from Server', props<Game>())

