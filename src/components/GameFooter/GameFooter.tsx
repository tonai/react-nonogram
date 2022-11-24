import { ChangeEvent, useContext } from 'react'

import { configContext } from '../../contexts'
import { TileState } from '../../types'

import './GameFooter.css'

interface IProps {
  controlState: TileState
  onControlChange: (controlState: TileState) => void
}

function Footer(props: IProps): JSX.Element {
  const { controlState, onControlChange } = props
  const { config } = useContext(configContext)
  const { useMouseRightClick } = config

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    onControlChange(Number(event.target.value) as TileState)
  }

  return (
    <div className="GameFooter">
      {!useMouseRightClick && (
        <>
          <label className="GameFooter__button">
            <input
              checked={controlState === TileState.REVEALED}
              className="GameFooter__radio visually-hidden"
              name="controlState"
              onChange={handleChange}
              type="radio"
              value={TileState.REVEALED}
            />
            <span className="GameFooter__text">reveal</span>
          </label>
          <label className="GameFooter__button">
            <input
              checked={controlState === TileState.MARKED}
              className="GameFooter__radio visually-hidden"
              name="controlState"
              onChange={handleChange}
              type="radio"
              value={TileState.MARKED}
            />
            <span className="GameFooter__text">mark</span>
          </label>
        </>
      )}
    </div>
  )
}

export default Footer
