import {createAction, props} from '@ngrx/store'
import { Player } from '../interfaces'


export const storePlayer = createAction('[Players Effect] Store Player',
                                      props<Player>()
                                    )
export const loadIndexDbPlayers = createAction('[App] Load IndexDb Players')
export const addPlayersStore = createAction(
  '[Player Effects] Add Players to Store',props<{payload: Player[]}>()
)
export const resetLocal = createAction('[Players Component] ResetLocal')
export const validatePlayer = createAction('[Players Component] Validate Player', props<Player>())
export const httpSyncPlayers = createAction('[App] Http Sync Players')
export const playerSynced = createAction('[Players Effect] Player Synced',props<Player>())
export const pullPlayerHttp = createAction('[Player Effect] Pull Player from Server',props<{payload: string}>())
export const newHttpPulledGame = createAction('[Game Effect] Check if Players Exist else pull form Server',props<{payload: string[]}>())
