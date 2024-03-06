import {createAction, props} from '@ngrx/store'
import { Player } from '../interfaces'


export const storePlayer = createAction('[Players Effect] Store Player',
                                      props<Player>()
                                    )
export const loadIndexDbPlayers = createAction('[App] Load IndexDb Players')
export const loadIndexDBPlayersSuccess = createAction(
  '[App] Load Players Success',props<{payload: Player[]}>()
)
export const resetLocal = createAction('[Players Component] ResetLocal')
export const validatePlayer = createAction('[Players Component] Validate Player', props<Player>())
export const httpSyncPlayers = createAction('[App] Http Sync Players')
export const playerSynced = createAction('[Players Effect] Player Synced',props<Player>())
