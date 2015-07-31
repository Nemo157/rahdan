import { Verb } from './verb'
import { Application } from './application'
import { EventContext } from './event_context'
import { Around, Before, Route, After, ApplicationImpl } from './application_impl'

export class Builder {
  private _arounds: Around[] = []
  private _befores: Before[] = []
  private _routes: Route[] = []
  private _afters: After[] = []

  public build(): Application {
    return new ApplicationImpl(this._arounds, this._befores, this._routes, this._afters)
  }

  public run() {
    return this.build().run()
  }

  public use(plugin: (builder: Builder) => void) {
    plugin(this)
    return this
  }

  public any(path: string, callback: (context: EventContext) => void): Builder
  public any(path: string, callback: (context: EventContext) => PromiseLike<void>): Builder {
    return this.route(Verb.any, path, callback)
  }

  public get(path: string, callback: (context: EventContext) => void): Builder
  public get(path: string, callback: (context: EventContext) => PromiseLike<void>): Builder {
    return this.route(Verb.get, path, callback)
  }

  public put(path: string, callback: (context: EventContext) => void): Builder
  public put(path: string, callback: (context: EventContext) => PromiseLike<void>): Builder {
    return this.route(Verb.put, path, callback)
  }

  public post(path: string, callback: (context: EventContext) => void): Builder
  public post(path: string, callback: (context: EventContext) => PromiseLike<void>): Builder {
    return this.route(Verb.post, path, callback)
  }

  public del(path: string, callback: (context: EventContext) => void): Builder
  public del(path: string, callback: (context: EventContext) => PromiseLike<void>): Builder {
    return this.route(Verb.del, path, callback)
  }

  public around(callback: (context: EventContext, route: () => PromiseLike<void>) => void): Builder
  public around(callback: (context: EventContext, route: () => PromiseLike<void>) => PromiseLike<void>): Builder {
    this._arounds.push(new Around(callback))
    return this
  }

  public before(callback: (context: EventContext) => PromiseLike<void>): Builder {
    this._befores.push(new Before(callback))
    return this
  }

  public route(verb: Verb, path: string, callback: (context: EventContext) => PromiseLike<void>): Builder {
    this._routes.push(new Route(verb, path, callback))
    return this
  }

  public after(callback: (context: EventContext) => PromiseLike<void>): Builder {
    this._afters.push(new After(callback))
    return this
  }
}
