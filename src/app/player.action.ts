import {createAction, props} from '@ngrx/store'
import { Player } from './interfaces'


export const playerValidated = createAction('[Players Effect] New Player Validated',
                                      props<Player>()
                                    )
export const loadIndexDbPlayers = createAction('[App] Load IndexDb Players')
export const loadIndexDBPlayersSuccess = createAction(
  '[App] Load Players Success',props<{payload: Player[]}>()
)
export const resetLocal = createAction('[Players Component] ResetLocal')
export const validatePlayer = createAction('[Players Component] Validate Player', props<Player>())

