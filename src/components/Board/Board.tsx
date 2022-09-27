/* eslint-disable react/no-array-index-key */
import { MouseEvent } from 'react'
import classnames from 'classnames'

import { IGame, IGameState, TileState } from '../../types'

import './Board.css'

interface IProps {
  gameData: IGame
  gameState: IGameState
  onMark?: (x: number, y: number) => void
  onReveal?: (x: number, y: number) => void
}

function Board(props: IProps): JSX.Element {
  const { gameData, gameState, onMark, onReveal } = props
  const { board, cols, rows } = gameData
  const { boardState, colsState, rowsState } = gameState

  function handleClick(x: number, y: number) {
    return (): void => onReveal?.(x, y)
  }

  function handleContextMenu(x: number, y: number) {
    return (event: MouseEvent): void => {
      event.preventDefault()
      onMark?.(x, y)
    }
  }

  return (
    <table className="Board">
      <thead>
        <tr>
          <th />
          {cols.map((col, x) => (
            <th className="Board__cols" key={x}>
              {col.map((value, y) => (
                <div
                  className={classnames({
                    'Board__clue--complete': colsState[x][y],
                  })}
                  key={y}
                >
                  {value}
                </div>
              ))}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, y) => (
          <tr key={y}>
            <th className="Board__rows">
              {row.map((value, x) => (
                <span
                  className={classnames({
                    'Board__clue--complete': rowsState[x][y],
                  })}
                  key={x}
                >
                  {value}{' '}
                </span>
              ))}
            </th>
            {board.map((col, x) => (
              <td className="Board__tile" key={x}>
                {boardState[x][y] === TileState.HIDDEN && (
                  <button
                    className="Board__button"
                    onClick={handleClick(x, y)}
                    onContextMenu={handleContextMenu(x, y)}
                    type="button"
                  />
                )}
                {boardState[x][y] === TileState.REVEALED &&
                  Boolean(board[x][y]) && (
                    <div
                      className="Board__cell"
                      style={{
                        backgroundColor: `rgba(${String(board[x][y])})`,
                      }}
                    />
                  )}
                {boardState[x][y] === TileState.REVEALED && !board[x][y] && (
                  <div className="Board__cell Board__cell--error">X</div>
                )}
                {boardState[x][y] === TileState.MARKED && (
                  <div className="Board__cell">X</div>
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Board
