import {
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { INDICATOR_LEFT_OFFSET, INDICATOR_TOP_OFFSET } from '../constants'
import { configContext } from '../contexts'
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
  endTile?: ITile
  indicatorRef: RefObject<R>
  selectedTiles: ITile[]
  start: (
    tile: ITile,
    state: TileState,
    x: number,
    y: number,
    pointerType: string
  ) => void
  startTile?: ITile
  tableRef: RefObject<HTMLTableSectionElement>
}

export function useBoardSelection<R extends HTMLElement = HTMLElement>(
  board: IBoard,
  onSelect?: (tiles: ITile[], state: TileState) => void
): IBoardSelection<R> {
  const tableRef = useRef<HTMLTableSectionElement>(null)
  const indicatorRef = useRef<R>(null)
  const firstTileDataRef = useRef<IFirstTileData>()
  const pointerStartRef = useRef<IPointerStart>()
  const [startTile, setStartTile] = useState<ITile>()
  const [selectedTiles, setSelectedTiles] = useState<ITile[]>([])
  const { config } = useContext(configContext)
  const { useMouseRightClick } = config

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
      setSelectedTiles([tile])
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

  // Cancel browser contextmenu
  useEffect(() => {
    function handleContextMenu(event: Event): void {
      event.preventDefault()
    }

    window.addEventListener('contextmenu', handleContextMenu)
    return () => window.removeEventListener('contextmenu', handleContextMenu)
  }, [])

  // Set up cancellation events
  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent): void {
      if (event instanceof TouchEvent && event.touches.length === 2) {
        stopSelection()
      } else if (
        !useMouseRightClick &&
        TileState.MARKED === getStateFromEvent(event)
      ) {
        event.preventDefault()
        stopSelection()
      } else if (
        useMouseRightClick &&
        pointerStartRef.current?.state &&
        pointerStartRef.current?.state !== getStateFromEvent(event)
      ) {
        event.preventDefault()
        stopSelection()
      }
    }

    if (startTile && pointerStartRef.current) {
      if (pointerStartRef.current.pointerType === 'touch') {
        window.addEventListener('touchstart', handlePointerDown)
        return () => window.removeEventListener('touchstart', handlePointerDown)
      }
      window.addEventListener('mousedown', handlePointerDown)
      return () => window.removeEventListener('mousedown', handlePointerDown)
    }
  }, [startTile, stopSelection, useMouseRightClick])

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
      const selectedTiles = getSelectedTile(
        pointerStart,
        position,
        firstTileData,
        board
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
  }, [board, onSelect, startTile, stopSelection, updateIndicator])

  const start = useCallback(
    (
      tile: ITile,
      state: TileState,
      x: number,
      y: number,
      pointerType: string
    ): void => {
      if (tile) {
        startSelection(tile, state, x, y, pointerType)
      }
    },
    [startSelection]
  )

  return useMemo(
    () => ({
      endTile: selectedTiles.at(-1),
      indicatorRef,
      selectedTiles,
      start,
      startTileId: startTile?.id,
      tableRef,
    }),
    [selectedTiles, start, startTile]
  )
}
