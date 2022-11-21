import { useState } from 'react'

import Menu from '../Menu/Menu'

import './Header.css'

function Header(): JSX.Element {
  const [open, setOpen] = useState(false)

  function handleClose(): void {
    setOpen(false)
  }

  function handleToggle(): void {
    setOpen((x) => !x)
  }

  return (
    <div className="Header">
      <button className="Header__button" onClick={handleToggle} type="button">
        {open ? 'Close menu' : 'Open menu'}
      </button>
      <Menu onClose={handleClose} open={open} />
    </div>
  )
}

export default Header
