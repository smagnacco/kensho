import { createContext, useContext } from 'react'
import { Lang, Strings, STRINGS } from './index'

export const LangContext = createContext<Strings>(STRINGS.es)

export function useLang(): Strings {
  return useContext(LangContext)
}

export type { Lang }
export { STRINGS }
