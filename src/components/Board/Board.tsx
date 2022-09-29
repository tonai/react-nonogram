/* eslint-disable react/no-array-index-key */
import {
  MouseEvent,
  PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import classnames from 'classnames'

import {
  IFirstTileData,
  IGame,
  IGameState,
  IPosition,
  ITile,
  TileState,
} from '../../types'
import { getSelectedTile } from '../../services'

import './Board.css'

// const height = 20
// const width = 20

interface IProps {
  gameData: IGame
  gameState: IGameState
  onSelect?: (tiles: ITile[], state: TileState) => void
}

function Board(props: IProps): JSX.Element {
  const { gameData, gameState, onSelect } = props
  const { board, cols, flatBoard, rows } = gameData
  const { boardState, colsState, rowsState } = gameState

  const tableRef = useRef<HTMLTableSectionElement>(null)
  const firstTileDataRef = useRef<IFirstTileData>()
  const pointerStartRef = useRef<IPosition>()
  const [startTile, setStartTile] = useState<ITile>()
  const [selectedTiles, setSelectedTiles] = useState<number[]>([])

  useEffect(() => {
    const firstTile = tableRef.current?.querySelector('td')
    if (firstTile) {
      const { height, left, top, width } = firstTile.getBoundingClientRect()
      firstTileDataRef.current = { height, left, top, width }
    }
  }, [])

  useEffect(() => {
    function handlePointerMove(event: PointerEvent): void {
      const position = { x: event.clientX, y: event.clientY }
      const selectedTileIds = getSelectedTile(
        pointerStartRef.current as IPosition,
        position,
        firstTileDataRef.current as IFirstTileData,
        board
      )
      setSelectedTiles((prevState) => {
        if (JSON.stringify(prevState) !== JSON.stringify(selectedTileIds)) {
          return selectedTileIds
        }
        return prevState
      })
    }

    function handlePointerUp(event: PointerEvent): void {
      const position = { x: event.clientX, y: event.clientY }
      const selectedTileIds = getSelectedTile(
        pointerStartRef.current as IPosition,
        position,
        firstTileDataRef.current as IFirstTileData,
        board
      )
      const selectedTiles = flatBoard.filter((tile) =>
        selectedTileIds.includes(tile.id)
      )
      onSelect?.(
        selectedTiles,
        event.button === 2 ? TileState.MARKED : TileState.REVEALED
      )
      setSelectedTiles([])
      setStartTile(undefined)
    }

    if (startTile && typeof window !== 'undefined') {
      window.addEventListener('pointermove', handlePointerMove)
      window.addEventListener('pointerup', handlePointerUp)
      return () => {
        window.removeEventListener('pointermove', handlePointerMove)
        window.removeEventListener('pointerup', handlePointerUp)
      }
    }
  }, [board, flatBoard, onSelect, startTile])

  // function handleClick(x: number, y: number) {
  //   return (): void => onSelect?.([{ x, y }], TileState.REVEALED)
  // }

  function handleContextMenu(event: MouseEvent): void {
    event.preventDefault()
  }

  function handlePointerDown(id: number) {
    return (event: ReactPointerEvent): void => {
      event.preventDefault()
      const tile = flatBoard.find((tile) => tile.id === id)
      if (tile) {
        setStartTile(tile)
        setSelectedTiles([tile.id])
        const position = { x: event.clientX, y: event.clientY }
        pointerStartRef.current = position
      }
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
      <tbody onContextMenu={handleContextMenu} ref={tableRef}>
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
              <td
                className={classnames('Board__tile', {
                  'Board__tile--active': selectedTiles.includes(col[y].id),
                })}
                key={x}
                onPointerDown={handlePointerDown(col[y].id)}
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
                {boardState[x][y] === TileState.REVEALED && !col[y].color && (
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
