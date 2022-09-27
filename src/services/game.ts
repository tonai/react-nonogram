import { IBoard, IColorMatch, IGame, IGameState, TileState } from '../types'

export function initGameData(imageData: ImageData, color: IColorMatch): IGame {
  const { data, height, width } = imageData

  // Init board
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
        board[x].push(null)
      } else {
        board[x].push([
          data[index],
          data[index + 1],
          data[index + 2],
          data[index + 3] / 255,
        ])
      }
    }
  }

  // Init cols
  const cols: number[][] = []
  for (let x = 0; x < width; x++) {
    cols.push([])
    let length = 0
    for (let y = 0; y < height; y++) {
      if (board[x][y]) {
        length++
      } else if (!board[x][y] && length > 0) {
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
      if (board[x][y]) {
        length++
      } else if (!board[x][y] && length > 0) {
        rows[y].push(length)
        length = 0
      }
    }
    if (length > 0) {
      rows[y].push(length)
    }
  }

  return { board, cols, rows }
}

export function initState(gameData: IGame): IGameState {
  const { board, cols, rows } = gameData

  // Init board state
  const boardState: TileState[][] = []
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

  return { boardState, colsState, rowsState }
}
