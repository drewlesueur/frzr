
// This is just a very basic inheritable Observable class, like node.js's but with jQuery's API style

export function Observable (data) {
  this.listeners = {}
  for (var key in data) {
    this[key] = data[key]
  }
}

Observable.prototype.on = function (name, cb, ctx, once) {
  this.listeners[name] || (this.listeners[name] = [])
  this.listeners[name].push({
    once: once || false,
    cb: cb,
    ctx: ctx
  })
}

Observable.prototype.one = function (name, cb, ctx) {
  this.on(name, cb, ctx, true)
}

Observable.prototype.off = function (name, cb, ctx) {
  if (typeof name === 'undefined') {
    this.listeners = {}
    return
  }
  if (typeof cb === 'undefined') {
    this.listeners[name] = []
    return
  }
  var listeners = this.listeners[name]
  if (!listeners) {
    return
  }
  for (var i = 0, len = listeners.length; i < len; i++) {
    if (ctx) {
      if (listeners[i].ctx === ctx) {
        listeners.splice(i--, 1)
        len--
      }
      continue
    }
    if (listeners[i].cb === cb) {
      listeners.splice(i--, 1)
      len--
    }
  }
}

Observable.prototype.trigger = function (name) {
  var listeners = this.listeners[name]
  var len = arguments.length - 1
  var args = new Array(len)

  // V8 optimization
  // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#3-managing-arguments

  for (var i = 0; i < len; i++) {
    args[i] = arguments[i + 1]
  }

  if (!listeners) {
    return
  }

  var listener

  for (i = 0; i < listeners.length; i++) {
    listener = listeners[i]
    listener.cb.apply(listener.ctx || this, args)
    if (listener.once) {
      listeners.splice(i--, 1)
      len--
    }
  }
}
