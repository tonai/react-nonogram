import { ReactNode } from 'react'

import './Layout.css'

interface IProps {
  children: ReactNode
}

function Layout(props: IProps): JSX.Element {
  const { children } = props
  return <div className="Layout">{children}</div>
}

export default Layout
