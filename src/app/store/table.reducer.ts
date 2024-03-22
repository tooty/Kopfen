
import {createReducer, on } from '@ngrx/store'
import { storeTable, storeSumTable } from './table.action'

export const emptyTable: ReadonlyArray<number[]> =  []

export const tableReducer = createReducer(
  emptyTable,
  on(storeTable,(_,n)=> n.table)
)

export const tableSumReducer = createReducer(
  emptyTable,
  on(storeSumTable,(_,n)=>n.table)
)
