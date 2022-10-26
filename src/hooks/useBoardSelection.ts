import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { INDICATOR_LEFT_OFFSET, INDICATOR_TOP_OFFSET } from '../constants'
import { getSelectedTile, getStateFromEvent } from '../services'
import {
  IBoard,
  IFirstTileData,
  IPointerStart,
  ITile,
  TileState,
} from '../types'

export interface IBoardSelection<R extends HTMLElement = HTMLElement> {
  indicatorRef: RefObject<R>
  selectedTiles: number[]
  start: (id: number, state: TileState, x: number, y: number) => void
  tableRef: RefObject<HTMLTableSectionElement>
}

export function useBoardSelection<R extends HTMLElement = HTMLElement>(
  board: IBoard,
  flatBoard: ITile[],
  onSelect?: (tiles: ITile[], state: TileState) => void
): IBoardSelection<R> {
  const tableRef = useRef<HTMLTableSectionElement>(null)
  const indicatorRef = useRef<R>(null)
  const firstTileDataRef = useRef<IFirstTileData>()
  const pointerStartRef = useRef<IPointerStart>()
  const [startTile, setStartTile] = useState<ITile>()
  const [selectedTiles, setSelectedTiles] = useState<number[]>([])

  const showIndicator = useCallback(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.display = 'block'
    }
  }, [])

  const hideIndicator = useCallback(() => {
    if (indicatorRef.current) {
      indicatorRef.current.style.display = 'none'
    }
  }, [])

  const updateIndicator = useCallback(
    (x: number, y: number, length: number) => {
      if (indicatorRef.current) {
        indicatorRef.current.style.top = `${y - INDICATOR_TOP_OFFSET}px`
        indicatorRef.current.style.left = `${x - INDICATOR_LEFT_OFFSET}px`
        indicatorRef.current.innerText = String(length)
      }
    },
    []
  )

  const startSelection = useCallback(
    (tile: ITile, state: TileState, x: number, y: number) => {
      setStartTile(tile)
      setSelectedTiles([tile.id])
      pointerStartRef.current = { state, x, y }
      showIndicator()
      updateIndicator(x, y, 1)
    },
    [showIndicator, updateIndicator]
  )

  const stopSelection = useCallback(() => {
    setSelectedTiles([])
    setStartTile(undefined)
    pointerStartRef.current = undefined
    hideIndicator()
  }, [hideIndicator])

  // Get initial tile position, init indicator
  useEffect(() => {
    const firstTile = tableRef.current?.querySelector('td')
    if (firstTile) {
      const { height, left, top, width } = firstTile.getBoundingClientRect()
      firstTileDataRef.current = { height, left, top, width }
    }
    if (indicatorRef.current) {
      indicatorRef.current.style.position = 'absolute'
      hideIndicator()
    }
  }, [hideIndicator])

  // Set up cancellation mouse events
  useEffect(() => {
    function handlePointerDown(event: MouseEvent): void {
      event.preventDefault()
      if (
        pointerStartRef.current?.state &&
        pointerStartRef.current?.state !== getStateFromEvent(event)
      ) {
        stopSelection()
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
  }, [stopSelection])

  // Set up selection mouse events
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
      updateIndicator(event.clientX, event.clientY, selectedTileIds.length)
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
      stopSelection()
    }

    if (startTile && typeof window !== 'undefined') {
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
      return () => {
        window.removeEventListener('mousemove', handlePointerMove)
        window.removeEventListener('mouseup', handlePointerUp)
      }
    }
  }, [board, flatBoard, onSelect, startTile, stopSelection])

  function start(id: number, state: TileState, x: number, y: number): void {
    const tile = flatBoard.find((tile) => tile.id === id)
    if (tile) {
      startSelection(tile, state, x, y)
    }
  }

  return { indicatorRef, selectedTiles, start, tableRef }
}
