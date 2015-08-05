import { Verb } from './verb'
import { Params, EventContext } from './event_context'
import { EventContextImpl } from './event_context_impl'
import { Route } from './route'
import sequence from './sequence'

export type Around = (context: EventContext, route: () => Promise<void>) => PromiseLike<any>

interface URLUtils {
  host: string
  href: string
  pathname: string
}

export class ApplicationImpl {
  private _running: boolean = false
  private _onClick: (event: Event) => void
  private _onPopState: (event: Event) => void
  private _lastLocation: { verb: Verb, location: string }

  constructor(private _promise: PromiseConstructor, private _arounds: Around[], private _routes: Route[]) {
    this._onClick = this.onClick.bind(this)
    this._onPopState = this.onPopState.bind(this)
  }

  public get running() { return this._running }

  public reload() {
    this.runRoute(Verb.get, location, false);
  }

  public run() {
    this._running = true
    document.addEventListener('click', this._onClick)
    window.addEventListener('popstate', this._onPopState)
    this.locationChanged(location, false);
    return this
  }

  public unload() {
    this._running = false
    document.removeEventListener('click', this._onClick)
    window.removeEventListener('popstate', this._onPopState)
    return this
  }

  private onPopState(event: PopStateEvent) {
    this.locationChanged(location, true)
  }

  private onClick(event: Event) {
    if (event.target instanceof HTMLAnchorElement) {
      var target = <HTMLAnchorElement>event.target
      if (location.hostname === target.hostname) {
        event.preventDefault()
        history.pushState({}, '', target.href)
        this.locationChanged(target, false)
      }
    }
  }

  private locationChanged(target: URLUtils, historical: boolean) {
    if (!this._lastLocation || this._lastLocation.verb != Verb.get || this._lastLocation.location != target.href) {
      this._lastLocation = { verb: Verb.get, location: target.href }
      return this.runRoute(Verb.get, target, historical);
    } else {
      return this._promise.resolve<EventContext>(undefined);
    }
  }

  private runRoute(verb: Verb, location: URLUtils, historical: boolean) {
    var route = this._routes.find(route => route.matches(verb, location.pathname))
    if (route) {
      var params = route.extractParams(location.pathname)
      var context = new EventContextImpl(verb, location.host, location.pathname, params, historical)

      var fullRoute = this._arounds.reduceRight<() => Promise<void>>(
          (next, around) => () => this._promise.resolve(around(context, next)),
          () => this._promise.resolve(route.callback(context)))

      return fullRoute().then(() => context)
    }
  }
}
