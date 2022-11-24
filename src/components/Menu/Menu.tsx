import { useContext } from 'react'
import classNames from 'classnames'

import { configContext } from '../../contexts'

import './Menu.css'

interface IProps {
  onClose: () => void
  open: boolean
}

function Menu(props: IProps): JSX.Element {
  const { onClose, open } = props
  const { config, setConfig } = useContext(configContext)
  const { useMouseRightClick } = config

  function handleChange(): void {
    setConfig((prevState) => ({
      ...prevState,
      useMouseRightClick: !prevState.useMouseRightClick,
    }))
  }

  return (
    <div className={classNames('Menu', { 'Menu--open': open })}>
      <button className="Menu__close" onClick={onClose} type="button">
        ✕
      </button>
      <label className="Menu__control">
        <input
          type="checkbox"
          checked={useMouseRightClick}
          onChange={handleChange}
        />
        <span>Use mouse right click</span>
      </label>
    </div>
  )
}

export default Menu
