import { Verb } from './verb'
import { Params, EventContext } from './event_context'
import { EventContextImpl } from './event_context_impl'

export type Done = PromiseLike<void> | void

export class Around {
  private nominal = true
  constructor(public callback: (context: EventContext, route: () => PromiseLike<void>) => Done) { }
}

export class Before {
  private nominal = true
  constructor(public callback: (context: EventContext) => Done) { }
}

export class Route {
  private nominal = true

  public pathRegex: RegExp
  public paramNames: string[]

  constructor(public verb: Verb, public path: string, public callback: (context: EventContext) => Done) {
    this.paramNames = []
    this.pathRegex = new RegExp(path.replace(/:[\w\d]+/g, match => (this.paramNames.push(match.substring(1)), '([^\/]+)')) + '$')
  }

  public matches(verb: Verb, path: string) {
    return ((this.verb & verb) !== Verb.none) && (!!this.pathRegex.test(path))
  }

  public extractParams(path: string) {
    var params: { [key: string]: string } = {}
    var paramValues = this.pathRegex.exec(path)
    paramValues.shift()
    for (var i = 0; i < paramValues.length; i++) {
      params[this.paramNames[i]] = paramValues[i]
    }
    return params
  }
}

export class After {
  private nominal = true
  constructor(public callback: (context: EventContext) => Done) { }
}

export class ApplicationImpl {
  private _running: boolean = false
  private _onClick: (event: Event) => void
  private _onPopState: (event: Event) => void
  private _lastLocation: { verb: Verb, location: string }

  constructor(
    private _arounds: Around[],
    private _befores: Before[],
    private _routes: Route[],
    private _afters: After[]) {

    this._onClick = this.onClick.bind(this)
    this._onPopState = this.onPopState.bind(this)
  }

  public get running() { return this._running }

  public reload() {
    this.runRoute(Verb.get, location);
  }

  public run() {
    this._running = true
    document.addEventListener('click', this._onClick)
    window.addEventListener('popstate', this._onPopState)
    this.locationChanged()
    return this
  }

  public unload() {
    this._running = false
    document.removeEventListener('click', this._onClick)
    window.removeEventListener('popstate', this._onPopState)
    return this
  }

  private onPopState(event: Event) {
    this.locationChanged()
  }

  private onClick(event: Event) {
    if (event.target instanceof HTMLAnchorElement) {
      var target = <HTMLAnchorElement>event.target
      if (location.hostname === target.hostname) {
        event.preventDefault()
        history.pushState({}, '', target.href)
        this.locationChanged()
      }
    }
  }

  private locationChanged() {
    if (!this._lastLocation || this._lastLocation.verb != Verb.get || this._lastLocation.location != location.href) {
      this._lastLocation = { verb: Verb.get, location: location.href }
      this.runRoute(Verb.get, location);
    }
  }

  private runRoute(verb: Verb, location: Location) {
    var route = this._routes.find(route => route.matches(verb, location.pathname))
    if (route) {
      var params = route.extractParams(location.pathname)
      route.callback(new EventContextImpl(verb, location.host, location.pathname, params))
    }
  }
}
