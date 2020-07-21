import ErrorThrower from "../utils/ErrorThrower";

export const stopPropagation = (event) => event.stopPropagation();

class EventBus {
  constructor() {
    this._allObject = {};
    this._listeners = new Map();
  }

  addListener(eventName, targetOrCallback, callbackOrScope = null, scope = null) {
    let listeners;
    let callbacks;
    let callback;
    let key;

    if (this._listeners.has(eventName)) {
      listeners = this._listeners.get(eventName);
    } else {
      listeners = new WeakMap();
      this._listeners.set(eventName, listeners);
    }

    switch (typeof targetOrCallback) {
      case 'function':
        key = this._allObject;
        callback = targetOrCallback;
        scope = callbackOrScope;
        break;
      case 'object':
        key = targetOrCallback;
        callback = callbackOrScope;
        break;
      default:
        ErrorThrower.invalidParameter();
    }

    callbacks = listeners.get(key) || [];
    callbacks.push({
      callback,
      scope,
    });
    listeners.set(key, callbacks);

    return this;
  }

  hasEventListener(eventName, targetOrCallback, callbackOrScope = null, scope = null) {
    const listeners = this._listeners.get(eventName);
    let callbacks;
    let callback;
    let key;

    if (listeners) {
      switch (typeof targetOrCallback) {
        case 'function':
          key = this._allObject;
          callback = targetOrCallback;
          scope = callbackOrScope;
          break;
        case 'object':
          key = targetOrCallback;
          callback = callbackOrScope;
          break;
        default:
          ErrorThrower.invalidParameter();
      }
      callbacks = listeners.get(key);

      return !!(callbacks && callbacks.find((i) => i.callback === callback && i.scope === scope));
    }

    return false;
  }

  removeListener(eventName, targetOrCallback, callbackOrScope = null, scope = null) {
    const listeners = this._listeners.get(eventName);
    let callbacks;
    let callback;
    let key;

    if (listeners) {
      switch (typeof targetOrCallback) {
        case 'function':
          key = this._allObject;
          callback = targetOrCallback;
          scope = callbackOrScope;
          break;
        case 'object':
          key = targetOrCallback;
          callback = callbackOrScope;
          break;
        default:
          ErrorThrower.invalidParameter();
      }
      callbacks = listeners.get(key);

      if (callbacks) {
        callbacks = callbacks.filter((i) => !(i.callback === callback && i.scope === scope));
        listeners.set(key, callbacks);
      }
    }

    return this;
  }

  dispatch(eventName, target, ...args) {
    let listeners = this._listeners.get(eventName);

    if (listeners) {
      args = [{
        type: eventName,
        target,
      }].concat(args);

      listeners = (listeners.get(target) || []).concat(listeners.get(this._allObject) || []);

      listeners.forEach((i) => {
        i.callback.apply(i.scope || window, args);
      });
    }

    return this;
  }
}

export default EventBus;
