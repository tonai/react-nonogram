import { IColor } from './color'

export interface ITile {
  color: IColor | null
  id: number
  x: number
  y: number
}

export type IBoard = ITile[][]

export interface IGame {
  board: IBoard
  cols: number[][]
  flatBoard: ITile[]
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

export interface IPosition {
  x: number
  y: number
}

export interface IPointerStart extends IPosition {
  pointerType: string
  x: number
  y: number
  state: TileState
}

export interface IFirstTileData {
  height: number
  left: number
  top: number
  width: number
}
