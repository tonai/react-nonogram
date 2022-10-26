/* eslint-disable react/no-array-index-key */
import { PointerEvent } from 'react'
import classnames from 'classnames'

import { IGame, IGameState, ITile, TileState } from '../../types'
import { getStateFromEvent } from '../../services'

import './Board.css'
import { useBoardSelection } from '../../hooks'

interface IProps {
  gameData: IGame
  gameState: IGameState
  onSelect?: (tiles: ITile[], state: TileState) => void
}

function Board(props: IProps): JSX.Element {
  const { gameData, gameState, onSelect } = props
  const { board, cols, flatBoard, rows } = gameData
  const { boardState, colsState, rowsState } = gameState

  const { indicatorRef, selectedTiles, start, tableRef } =
    useBoardSelection<HTMLDivElement>(board, flatBoard, onSelect)

  function handlePointerDown(id: number) {
    return (event: PointerEvent): void => {
      start(
        id,
        getStateFromEvent(event),
        event.clientX,
        event.clientY,
        event.pointerType
      )
    }
  }

  return (
    <>
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
        <tbody ref={tableRef}>
          {rows.map((row, y) => (
            <tr key={y}>
              <th className="Board__rows">
                {row.map((value, x) => (
                  <span
                    className={classnames({
                      'Board__clue--complete': rowsState[y][x],
                    })}
                    key={x}
                  >
                    {value}{' '}
                  </span>
                ))}
              </th>
              {board.map((col, x) => (
                <td className="Board__tile" key={x}>
                  <button
                    className={classnames('Board__button', {
                      'Board__button--active': selectedTiles.includes(
                        col[y].id
                      ),
                    })}
                    onPointerDown={handlePointerDown(col[y].id)}
                    type="button"
                  >
                    {boardState[x][y] === TileState.REVEALED &&
                      Boolean(col[y].color) && (
                        <div
                          className="Board__cell"
                          style={{
                            backgroundColor: `rgba(${String(col[y].color)})`,
                          }}
                        />
                      )}
                    {boardState[x][y] === TileState.REVEALED &&
                      !col[y].color && (
                        <div className="Board__cell Board__cell--error">X</div>
                      )}
                    {boardState[x][y] === TileState.MARKED && (
                      <div className="Board__cell">X</div>
                    )}
                  </button>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="Indicator" ref={indicatorRef} />
    </>
  )
}

export default Board
