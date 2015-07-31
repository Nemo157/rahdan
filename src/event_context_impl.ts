import { Verb } from './verb'

export class EventContextImpl {
  public get verb() { return this._verb }
  public get base() { return this._base }
  public get path() { return this._path }
  public get params() { return this._params }

  public constructor(
    private _verb: Verb,
    private _base: string,
    private _path: string,
    private _params: { [key: string]: string }) {
  }
}
