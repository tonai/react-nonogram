import { Dispatch, SetStateAction, createContext } from 'react'

export interface IConfig {
  useMouseRightClick?: boolean
}

export interface IConfigContext {
  config: IConfig
  setConfig: Dispatch<SetStateAction<IConfig>>
}

export const configContext = createContext<IConfigContext>({
  config: {},
  setConfig: () => void null,
})
