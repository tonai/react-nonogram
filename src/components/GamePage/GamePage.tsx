import { useMemo, useState } from 'react'

import {
  calculateBoardState,
  calculateColsState,
  calculateRowsState,
  fillCompletedCols,
  fillCompletedRows,
  initGameData,
  initState,
} from '../../services'
import { ITile, TileState } from '../../types'

import Board from '../Board/Board'
import GameFooter from '../GameFooter/GameFooter'

interface IProps {
  imageData: ImageData
}

function GamePage(props: IProps): JSX.Element {
  const { imageData } = props
  const gameData = useMemo(
    () => initGameData(imageData, ['*', '*', '*', 0]),
    [imageData]
  )
  const [gameState, setGameState] = useState(() => initState(gameData))
  const [controlState, setControlState] = useState(TileState.REVEALED)

  function handleSelect(tiles: ITile[], state: TileState): void {
    setGameState((prevState) => {
      let { boardState, colsState, rowsState } = prevState
      boardState = calculateBoardState(boardState, tiles, state)
      if (state === TileState.REVEALED) {
        colsState = calculateColsState(gameData, boardState)
        rowsState = calculateRowsState(gameData, boardState)
        boardState = fillCompletedCols(boardState, colsState)
        boardState = fillCompletedRows(boardState, rowsState)
      }
      return { boardState, colsState, rowsState }
    })
  }

  return (
    <>
      <Board
        controlState={controlState}
        gameData={gameData}
        gameState={gameState}
        onSelect={handleSelect}
      />
      <GameFooter
        controlState={controlState}
        onControlChange={setControlState}
      />
    </>
  )
}

export default GamePage
