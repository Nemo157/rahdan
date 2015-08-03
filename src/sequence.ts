function sequence(callbacks: Array<() => Promise<void>>): Promise<void> {
  let promise = Promise.resolve<void>(undefined)
  callbacks.forEach(callback => promise = promise.then(callback))
  return promise
}

export default sequence
