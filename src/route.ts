import { EventContext } from './event_context'
import { Verb } from './verb'

export class Route {
  public pathRegex: RegExp
  public paramNames: string[]

  constructor(public verb: Verb, public path: string, public callback: (context: EventContext) => PromiseLike<any> | any) {
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

