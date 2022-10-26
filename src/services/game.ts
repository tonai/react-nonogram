import {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from 'react'
import {
  IBoard,
  IColorMatch,
  IFirstTileData,
  IGame,
  IGameState,
  IPosition,
  ITile,
  TileState,
} from '../types'

export function initGameData(imageData: ImageData, color: IColorMatch): IGame {
  const { data, height, width } = imageData

  // Init board
  let id = 0
  const board: IBoard = []
  for (let x = 0; x < width; x++) {
    board.push([])
    for (let y = 0; y < height; y++) {
      const index = (x + y * width) * 4
      if (
        (color[0] === '*' || data[index] === color[0]) &&
        (color[1] === '*' || data[index + 1] === color[1]) &&
        (color[2] === '*' || data[index + 2] === color[2]) &&
        (color[3] === '*' || data[index + 3] === color[3])
      ) {
        board[x].push({
          color: null,
          id,
          x,
          y,
        })
      } else {
        board[x].push({
          color: [
            data[index],
            data[index + 1],
            data[index + 2],
            data[index + 3] / 255,
          ],
          id,
          x,
          y,
        })
      }
      id++
    }
    id++
  }

  // Init flat board
  const flatBoard = board.flat()

  // Init cols
  const cols: number[][] = []
  for (let x = 0; x < width; x++) {
    cols.push([])
    let length = 0
    for (let y = 0; y < height; y++) {
      if (board[x][y].color) {
        length++
      } else if (!board[x][y].color && length > 0) {
        cols[x].push(length)
        length = 0
      }
    }
    if (length > 0) {
      cols[x].push(length)
    }
  }

  // Init rows
  const rows: number[][] = []
  for (let y = 0; y < height; y++) {
    rows.push([])
    let length = 0
    for (let x = 0; x < width; x++) {
      if (board[x][y].color) {
        length++
      } else if (!board[x][y].color && length > 0) {
        rows[y].push(length)
        length = 0
      }
    }
    if (length > 0) {
      rows[y].push(length)
    }
  }

  return { board, cols, flatBoard, rows }
}

export function initState(gameData: IGame): IGameState {
  const { board, cols, rows } = gameData

  // Init board state
  let boardState: TileState[][] = []
  for (let x = 0; x < board.length; x++) {
    boardState.push([])
    for (let y = 0; y < board[x].length; y++) {
      boardState[x].push(TileState.HIDDEN)
    }
  }

  // Init cols state
  const colsState: boolean[][] = []
  for (let x = 0; x < cols.length; x++) {
    colsState.push([])
    for (let y = 0; y < cols[x].length; y++) {
      colsState[x].push(false)
    }
  }

  // Init rows state
  const rowsState: boolean[][] = []
  for (let x = 0; x < rows.length; x++) {
    rowsState.push([])
    for (let y = 0; y < rows[x].length; y++) {
      rowsState[x].push(false)
    }
  }

  // Fill completed rows if any (row or col is fully blank)
  boardState = fillCompletedCols(boardState, colsState)
  boardState = fillCompletedRows(boardState, rowsState)

  return { boardState, colsState, rowsState }
}

export function fillCompletedCols(
  boardState: TileState[][],
  colsState: boolean[][]
): TileState[][] {
  let result = boardState
  for (let x = 0; x < colsState.length; x++) {
    if (colsState[x].every((x) => x)) {
      result = result.map((row, i) =>
        row.map((val) =>
          i === x && val === TileState.HIDDEN ? TileState.MARKED : val
        )
      )
    }
  }
  return result
}

export function fillCompletedRows(
  boardState: TileState[][],
  rowsState: boolean[][]
): TileState[][] {
  let result = boardState
  for (let y = 0; y < rowsState.length; y++) {
    if (rowsState[y].every((x) => x)) {
      result = result.map((row) =>
        row.map((val, j) =>
          j === y && val === TileState.HIDDEN ? TileState.MARKED : val
        )
      )
    }
  }
  return result
}

export function calculateBoardState(
  boardState: TileState[][],
  tiles: ITile[],
  state: TileState
): TileState[][] {
  const tilesMap = new Map(tiles.map((tile) => [`${tile.x}-${tile.y}`, tile]))

  const tileStates = []
  // const tileStatesMap = new Map()
  for (let x = 0; x < boardState.length; x++) {
    for (let y = 0; y < boardState[x].length; y++) {
      if (tilesMap.has(`${x}-${y}`)) {
        const state = boardState[x][y]
        // const tile = tilesMap.get(`${x}-${y}`) as ITile
        // tileStatesMap.set(tile.id, state)
        tileStates.push(state)
      }
    }
  }

  if (state === TileState.MARKED) {
    if (tileStates.every((state) => state !== TileState.HIDDEN)) {
      // Unmark all hidden tiles
      return boardState.map((col, i) =>
        col.map((state, j) => {
          if (tilesMap.has(`${i}-${j}`) && state === TileState.MARKED) {
            return TileState.HIDDEN
          }
          return state
        })
      )
    }
    // Mark all hidden tiles
    return boardState.map((col, i) =>
      col.map((state, j) => {
        if (tilesMap.has(`${i}-${j}`) && state === TileState.HIDDEN) {
          return TileState.MARKED
        }
        return state
      })
    )
  } else if (state === TileState.REVEALED) {
    const hiddenTiles = tiles.filter(
      ({ x, y }) => boardState[x][y] === TileState.HIDDEN
    )
    if (hiddenTiles.every((tile) => tile.color)) {
      // Reveal all hidden tiles
      return boardState.map((col, i) =>
        col.map((state, j) => {
          if (tilesMap.has(`${i}-${j}`) && state === TileState.HIDDEN) {
            return TileState.REVEALED
          }
          return state
        })
      )
    }
    // Reveal first error
    let revealed = false
    return boardState.map((col, i) =>
      col.map((state, j) => {
        if (
          tilesMap.has(`${i}-${j}`) &&
          state === TileState.HIDDEN &&
          !revealed
        ) {
          const tile = tilesMap.get(`${i}-${j}`) as ITile
          if (!tile.color) {
            revealed = true
            return TileState.REVEALED
          }
        }
        return state
      })
    )
  }

  return boardState
}

export function calculateColsState(
  gameData: IGame,
  boardState: TileState[][]
): boolean[][] {
  const { board } = gameData
  const colsState: boolean[][] = []
  for (let x = 0; x < board.length; x++) {
    colsState.push([])
    let length = 0
    let revealedLength = 0
    for (let y = 0; y < board[x].length; y++) {
      if (board[x][y].color) {
        length++
        if (boardState[x][y] === TileState.REVEALED) {
          revealedLength++
        }
      } else if (!board[x][y].color && length > 0) {
        colsState[x].push(length === revealedLength)
        length = 0
        revealedLength = 0
      }
    }
    if (length > 0) {
      colsState[x].push(length === revealedLength)
    }
  }
  return colsState
}

export function calculateRowsState(
  gameData: IGame,
  boardState: TileState[][]
): boolean[][] {
  const { board } = gameData
  const rowsState: boolean[][] = []
  for (let y = 0; y < board[0].length; y++) {
    rowsState.push([])
    let length = 0
    let revealedLength = 0
    for (let x = 0; x < board.length; x++) {
      if (board[x][y].color) {
        length++
        if (boardState[x][y] === TileState.REVEALED) {
          revealedLength++
        }
      } else if (!board[x][y].color && length > 0) {
        rowsState[y].push(length === revealedLength)
        length = 0
        revealedLength = 0
      }
    }
    if (length > 0) {
      rowsState[y].push(length === revealedLength)
    }
  }
  return rowsState
}

export function getSelectedTile(
  startPosition: IPosition,
  endPosition: IPosition,
  firstTileData: IFirstTileData,
  board: IBoard
): number[] {
  const { x: startX, y: startY } = startPosition
  const { x: endX, y: endY } = endPosition
  const { height, left, top, width } = firstTileData
  const selectedTiles: number[] = []

  if (Math.abs(endX - startX) > Math.abs(endY - startY)) {
    // Select in row
    const tile1X = Math.min(
      Math.max(Math.floor((startX - left) / width), 0),
      board.length - 1
    )
    const tile1Y = Math.min(
      Math.max(Math.floor((startY - top) / height), 0),
      board.length - 1
    )
    const tile2X = Math.min(
      Math.max(Math.floor((endX - left) / width), 0),
      board.length - 1
    )
    const increment = (tile2X - tile1X) / Math.abs(tile2X - tile1X)
    let i = tile1X
    for (i; i !== tile2X; i += increment) {
      selectedTiles.push(board[i][tile1Y].id)
    }
    selectedTiles.push(board[i][tile1Y].id)
  } else {
    // Select in col
    const tile1X = Math.min(
      Math.max(Math.floor((startX - left) / width), 0),
      board.length - 1
    )
    const tile1Y = Math.min(
      Math.max(Math.floor((startY - top) / height), 0),
      board[0].length - 1
    )
    const tile2Y = Math.min(
      Math.max(Math.floor((endY - top) / height), 0),
      board[0].length - 1
    )
    const increment = (tile2Y - tile1Y) / Math.abs(tile2Y - tile1Y)
    let j = tile1Y
    for (j; j !== tile2Y; j += increment) {
      selectedTiles.push(board[tile1X][j].id)
    }
    selectedTiles.push(board[tile1X][j].id)
  }

  return selectedTiles
}

export function getStateFromEvent(
  event: MouseEvent | PointerEvent | TouchEvent | ReactPointerEvent
): TileState {
  if (event instanceof TouchEvent) {
    return TileState.REVEALED
  }
  return event.button === 2 ? TileState.MARKED : TileState.REVEALED
}

export function getPositionFromEvent(
  event: MouseEvent | PointerEvent | TouchEvent
): IPosition {
  if (event instanceof TouchEvent && event.touches[0]) {
    return { x: event.touches[0].clientX, y: event.touches[0].clientY }
  } else if (event instanceof TouchEvent) {
    return {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY,
    }
  }
  return { x: event.clientX, y: event.clientY }
}
