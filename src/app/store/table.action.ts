import { createAction, props } from '@ngrx/store'

export const regenTable = createAction('[Effects] Regenerate Tabel')
export const regenTableSum = createAction('[Effects] Regenerate Sum Tabel',props<{table: number[][]}>())
export const storeTable = createAction('[Table Effects] Store Table',props<{table: number[][]}>())
export const storeSumTable = createAction('[Table Effects] Store Sum Table',props<{table: number[][]}>())
