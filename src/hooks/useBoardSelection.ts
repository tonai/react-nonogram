import { RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { INDICATOR_LEFT_OFFSET, INDICATOR_TOP_OFFSET } from '../constants'
import {
  getPositionFromEvent,
  getSelectedTile,
  getStateFromEvent,
} from '../services'
import {
  IBoard,
  IFirstTileData,
  IPointerStart,
  IPosition,
  ITile,
  TileState,
} from '../types'

export interface IBoardSelection<R extends HTMLElement = HTMLElement> {
  indicatorRef: RefObject<R>
  selectedTiles: number[]
  start: (
    id: number,
    state: TileState,
    x: number,
    y: number,
    pointerType: string
  ) => void
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

  const updateIndicator = useCallback((position: IPosition, length: number) => {
    if (indicatorRef.current) {
      indicatorRef.current.style.top = `${position.y - INDICATOR_TOP_OFFSET}px`
      indicatorRef.current.style.left = `${
        position.x - INDICATOR_LEFT_OFFSET
      }px`
      indicatorRef.current.innerText = String(length)
    }
  }, [])

  const startSelection = useCallback(
    (
      tile: ITile,
      state: TileState,
      x: number,
      y: number,
      pointerType: string
    ) => {
      setStartTile(tile)
      setSelectedTiles([tile.id])
      pointerStartRef.current = { pointerType, state, x, y }
      showIndicator()
      updateIndicator({ x, y }, 1)
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

  // Set up cancellation events
  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent): void {
      if (
        event instanceof MouseEvent &&
        pointerStartRef.current?.state &&
        pointerStartRef.current?.state !== getStateFromEvent(event)
      ) {
        event.preventDefault()
        stopSelection()
      } else if (event instanceof TouchEvent && event.touches.length === 2) {
        stopSelection()
      }
    }

    function handleContextMenu(event: Event): void {
      event.preventDefault()
    }

    if (startTile && pointerStartRef.current) {
      if (pointerStartRef.current.pointerType === 'touch') {
        window.addEventListener('touchstart', handlePointerDown)
        return () => window.removeEventListener('touchstart', handlePointerDown)
      }
      window.addEventListener('mousedown', handlePointerDown)
      window.addEventListener('contextmenu', (event) => event.preventDefault())
      return () => {
        window.removeEventListener('mousedown', handlePointerDown)
        window.removeEventListener('contextmenu', handleContextMenu)
      }
    }
  }, [startTile, stopSelection])

  // Set up selection events
  useEffect(() => {
    function handlePointerMove(event: MouseEvent | TouchEvent): void {
      const pointerStart = pointerStartRef.current as IPointerStart
      const firstTileData = firstTileDataRef.current as IFirstTileData
      const position = getPositionFromEvent(event)
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
      updateIndicator(position, selectedTileIds.length)
    }

    function handlePointerUp(event: MouseEvent | TouchEvent): void {
      const pointerStart = pointerStartRef.current as IPointerStart
      const firstTileData = firstTileDataRef.current as IFirstTileData
      const position = getPositionFromEvent(event)
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

    if (startTile && typeof window !== 'undefined' && pointerStartRef.current) {
      if (pointerStartRef.current.pointerType === 'touch') {
        window.addEventListener('touchmove', handlePointerMove)
        window.addEventListener('touchend', handlePointerUp)
        return () => {
          window.removeEventListener('touchmove', handlePointerMove)
          window.removeEventListener('touchend', handlePointerUp)
        }
      }
      window.addEventListener('mousemove', handlePointerMove)
      window.addEventListener('mouseup', handlePointerUp)
      return () => {
        window.removeEventListener('mousemove', handlePointerMove)
        window.removeEventListener('mouseup', handlePointerUp)
      }
    }
  }, [board, flatBoard, onSelect, startTile, stopSelection, updateIndicator])

  function start(
    id: number,
    state: TileState,
    x: number,
    y: number,
    pointerType: string
  ): void {
    const tile = flatBoard.find((tile) => tile.id === id)
    if (tile) {
      startSelection(tile, state, x, y, pointerType)
    }
  }

  return { indicatorRef, selectedTiles, start, tableRef }
}
