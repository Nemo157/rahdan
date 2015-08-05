import { Verb } from './verb'
import { Application } from './application'
import { EventContext } from './event_context'
import { Around, ApplicationImpl } from './application_impl'
import { Route } from './route'

export class Builder {
  private _arounds: Around[] = []
  private _routes: Route[] = []
  private _promise: PromiseConstructor = Promise

  public build(): Application {
    return new ApplicationImpl(this._promise, this._arounds, this._routes)
  }

  public run() {
    return this.build().run()
  }

  public use<T>(plugin: (builder: Builder, config: T) => any, config: T) {
    plugin(this, config)
    return this
  }

  public usePromises(promise: PromiseConstructor) {
    this._promise = promise
    return this
  }

  public any(path: string, callback: (context: EventContext) => any): Builder
  public any(path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    return this.route(Verb.any, path, callback)
  }

  public get(path: string, callback: (context: EventContext) => any): Builder
  public get(path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    return this.route(Verb.get, path, callback)
  }

  public put(path: string, callback: (context: EventContext) => any): Builder
  public put(path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    return this.route(Verb.put, path, callback)
  }

  public post(path: string, callback: (context: EventContext) => any): Builder
  public post(path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    return this.route(Verb.post, path, callback)
  }

  public del(path: string, callback: (context: EventContext) => any): Builder
  public del(path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    return this.route(Verb.del, path, callback)
  }

  public around(callback: (context: EventContext, route: () => Promise<void>) => PromiseLike<any>): Builder {
    this._arounds.push(callback)
    return this
  }

  public route(verb: Verb, path: string, callback: (context: EventContext) => any): Builder
  public route(verb: Verb, path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    this._routes.push(new Route(verb, path, callback))
    return this
  }
}
