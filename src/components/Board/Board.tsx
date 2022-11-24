/* eslint-disable react/no-array-index-key */
import { PointerEvent, useContext } from 'react'
import classNames from 'classnames'

import { configContext } from '../../contexts'
import { useBoardSelection } from '../../hooks'
import { getStateFromEvent } from '../../services'
import { IGame, IGameState, ITile, TileState } from '../../types'

import './Board.css'

interface IProps {
  controlState: TileState
  gameData: IGame
  gameState: IGameState
  onSelect?: (tiles: ITile[], state: TileState) => void
}

function Board(props: IProps): JSX.Element {
  const { controlState, gameData, gameState, onSelect } = props
  const { board, cols, rows } = gameData
  const { boardState, colsState, rowsState } = gameState
  const { config } = useContext(configContext)

  const { endTile, indicatorRef, selectedTiles, start, tableRef } =
    useBoardSelection<HTMLDivElement>(board, onSelect)

  function handlePointerDown(tile: ITile) {
    return (event: PointerEvent): void => {
      start(
        tile,
        config.useMouseRightClick ? getStateFromEvent(event) : controlState,
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
                    className={classNames({
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
                    className={classNames({
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
                    className={classNames('Board__button', {
                      'Board__button--active': selectedTiles.includes(col[y]),
                      'Board__button--col': endTile?.x === x,
                      'Board__button--row': endTile?.y === y,
                    })}
                    onPointerDown={handlePointerDown(col[y])}
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
