import { Verb } from './verb'

export interface Params {
  [key: string]: string
}

export interface EventContext {
  verb: Verb
  base: string
  path: string
  params: Params
}
