/* eslint-disable react/no-array-index-key */
import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import classnames from 'classnames'

import {
  IFirstTileData,
  IGame,
  IGameState,
  IPointerStart,
  ITile,
  TileState,
} from '../../types'
import { getSelectedTile, getStateFromEvent } from '../../services'

import './Board.css'

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
  const pointerStartRef = useRef<IPointerStart>()
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
    function handlePointerDown(event: MouseEvent): void {
      event.preventDefault()
      if (
        pointerStartRef.current?.state &&
        pointerStartRef.current?.state !== getStateFromEvent(event)
      ) {
        setSelectedTiles([])
        setStartTile(undefined)
        pointerStartRef.current = undefined
      }
    }

    function handleContextMenu(event: Event): void {
      event.preventDefault()
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('contextmenu', (event) => event.preventDefault())
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  useEffect(() => {
    function handlePointerMove(event: MouseEvent): void {
      const pointerStart = pointerStartRef.current as IPointerStart
      const firstTileData = firstTileDataRef.current as IFirstTileData
      const position = { x: event.clientX, y: event.clientY }
      const selectedTileIds = getSelectedTile(
        pointerStart,
        position,
        firstTileData,
        board
      )
      setSelectedTiles((prevState) => {
        if (JSON.stringify(prevState) !== JSON.stringify(selectedTileIds)) {
          return selectedTileIds
        }
        return prevState
      })
    }

    function handlePointerUp(event: MouseEvent): void {
      const pointerStart = pointerStartRef.current as IPointerStart
      const firstTileData = firstTileDataRef.current as IFirstTileData
      const position = { x: event.clientX, y: event.clientY }
      const selectedTileIds = getSelectedTile(
        pointerStart,
        position,
        firstTileData,
        board
      )
      const selectedTiles = flatBoard.filter((tile) =>
        selectedTileIds.includes(tile.id)
      )
      onSelect?.(selectedTiles, pointerStart.state)
      setSelectedTiles([])
      setStartTile(undefined)
      pointerStartRef.current = undefined
    }

    if (startTile && typeof window !== 'undefined') {
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
      return () => {
        window.removeEventListener('mousemove', handlePointerMove)
        window.removeEventListener('mouseup', handlePointerUp)
      }
    }
  }, [board, flatBoard, onSelect, startTile])

  function handlePointerDown(id: number) {
    return (event: ReactPointerEvent): void => {
      const tile = flatBoard.find((tile) => tile.id === id)
      if (tile) {
        setStartTile(tile)
        setSelectedTiles([tile.id])
        pointerStartRef.current = {
          state: getStateFromEvent(event),
          x: event.clientX,
          y: event.clientY,
        }
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
