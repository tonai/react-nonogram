import classNames from 'classnames'

import './Menu.css'

interface IProps {
  onClose: () => void
  open: boolean
}

function Menu(props: IProps): JSX.Element {
  const { onClose, open } = props
  return (
    <div className={classNames('Menu', { 'Menu--open': open })}>
      <button className="Menu__close" onClick={onClose} type="button">
        ✕
      </button>
    </div>
  )
}

export default Menu
