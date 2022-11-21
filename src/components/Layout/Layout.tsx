import { ReactNode } from 'react'

import Header from '../Header/Header'

import './Layout.css'

interface IProps {
  children: ReactNode
}

function Layout(props: IProps): JSX.Element {
  const { children } = props
  return (
    <div className="Layout">
      <Header />
      <div className="Layout__content">{children}</div>
    </div>
  )
}

export default Layout
