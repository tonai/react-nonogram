import { ReactNode, useMemo, useState } from 'react'

import { IConfig, configContext } from '../../contexts'

interface IProps {
  children: ReactNode
}

function ConfigProvider(props: IProps): JSX.Element {
  const { children } = props
  const [config, setConfig] = useState<IConfig>({
    useMouseRightClick: false,
  })
  const contextValue = useMemo(
    () => ({
      config,
      setConfig,
    }),
    [config, setConfig]
  )
  return (
    <configContext.Provider value={contextValue}>
      {children}
    </configContext.Provider>
  )
}

export default ConfigProvider
