import { Verb } from './verb'
import { Application } from './application'
import { EventContext } from './event_context'
import { Around, Before, Route, After, ErrorHandler, ApplicationImpl } from './application_impl'

export class Builder {
  private _arounds: Around[] = []
  private _befores: Before[] = []
  private _routes: Route[] = []
  private _afters: After[] = []
  private _errors: ErrorHandler[] = []

  public build(): Application {
    return new ApplicationImpl(this._arounds, this._befores, this._routes, this._afters, this._errors)
  }

  public run() {
    return this.build().run()
  }

  public use<T>(plugin: (builder: Builder, config: T) => any, config: T) {
    plugin(this, config)
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

  public around(callback: (context: EventContext, route: () => PromiseLike<void>) => any): Builder
  public around(callback: (context: EventContext, route: () => PromiseLike<void>) => PromiseLike<any>): Builder {
    this._arounds.push(new Around(callback))
    return this
  }

  public before(callback: (context: EventContext) => any): Builder
  public before(callback: (context: EventContext) => PromiseLike<any>): Builder {
    this._befores.push(new Before(callback))
    return this
  }

  public route(verb: Verb, path: string, callback: (context: EventContext) => any): Builder
  public route(verb: Verb, path: string, callback: (context: EventContext) => PromiseLike<any>): Builder {
    this._routes.push(new Route(verb, path, callback))
    return this
  }

  public after(callback: (context: EventContext) => any): Builder
  public after(callback: (context: EventContext) => PromiseLike<any>): Builder {
    this._afters.push(new After(callback))
    return this
  }

  public error(callback: (context: EventContext, error: any) => any): Builder
  public error(callback: (context: EventContext, error: any) => PromiseLike<any>): Builder {
    this._errors.push(new ErrorHandler(callback))
    return this
  }
}
