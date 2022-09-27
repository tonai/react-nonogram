import { useMemo, useState } from 'react'

import { initGameData, initState } from '../../services'
import { IGame, TileState } from '../../types'

import Board from '../Board/Board'

interface IProps {
  imageData: ImageData
}

function calculateColsState(
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
      if (board[x][y]) {
        length++
        if (boardState[x][y] === TileState.REVEALED) {
          revealedLength++
        }
      } else if (!board[x][y] && length > 0) {
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

function calculateRowsState(
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
      if (board[x][y]) {
        length++
        if (boardState[x][y] === TileState.REVEALED) {
          revealedLength++
        }
      } else if (!board[x][y] && length > 0) {
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

function GamePage(props: IProps): JSX.Element {
  const { imageData } = props
  const gameData = useMemo(
    () => initGameData(imageData, ['*', '*', '*', 0]),
    [imageData]
  )
  const [gameState, setGameState] = useState(() => initState(gameData))

  function handleReveal(x: number, y: number): void {
    setGameState((prevState) => {
      const boardState = prevState.boardState.map((col, i) =>
        i === x
          ? col.map((val, j) => (j === y ? TileState.REVEALED : val))
          : col
      )
      return {
        ...prevState,
        boardState,
        colsState: calculateColsState(gameData, boardState),
        rowsState: calculateRowsState(gameData, boardState),
      }
    })
  }

  function handleMark(x: number, y: number): void {
    setGameState((prevState) => ({
      ...prevState,
      boardState: prevState.boardState.map((col, i) =>
        i === x ? col.map((val, j) => (j === y ? TileState.MARKED : val)) : col
      ),
    }))
  }

  return (
    <Board
      gameData={gameData}
      gameState={gameState}
      onReveal={handleReveal}
      onMark={handleMark}
    />
  )
}

export default GamePage
