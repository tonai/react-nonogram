import { IColor } from './color'

export type IBoard = (IColor | null)[][]

export interface IGame {
  board: IBoard
  cols: number[][]
  rows: number[][]
}

export enum TileState {
  HIDDEN,
  MARKED,
  REVEALED,
}

export interface IGameState {
  boardState: TileState[][]
  colsState: boolean[][]
  rowsState: boolean[][]
}
