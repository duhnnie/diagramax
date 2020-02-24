import _ from 'lodash';
import FunctionProxy from '../utils/FunctionProxy';

const DEFAULTS = Object.freeze({
  disabled: false,
});

const _listenersMap = new Map();

function initListeners(instance) {
  _listenersMap.set(instance, new WeakMap());
}

function getListeners(instance) {
  return _listenersMap.get(instance);
}

function getHandlerArray(instance, source, event, handler) {
  const listeners = getListeners(instance);
  const sourceMap = listeners.get(source);

  if (!sourceMap) return null;

  const eventMap = sourceMap.get(event);

  if (!eventMap) return null;

  const handlerArray = eventMap.get(handler);

  if (!handlerArray) return null;

  return handlerArray;
}

function clearHandlerArray(instance, source, event, handler) {
  const listeners = getListeners(instance);
  const sourceMap = listeners.get(source);

  if (!sourceMap) return false;

  const eventMap = sourceMap.get(event);

  if (!eventMap) return false;

  return eventMap.delete(handler);
}

function setListener(instance, source, event, handler, proxied) {
  const listeners = getListeners(instance);
  let sourceMap = listeners.get(source);

  if (!sourceMap) {
    sourceMap = new Map();
    listeners.set(source, sourceMap);
  }

  let eventMap = sourceMap.get(event);

  if (!eventMap) {
    eventMap = new WeakMap();
    sourceMap.set(event, eventMap);
  }

  let handlerArray = eventMap.get(handler);

  if (!handlerArray) {
    handlerArray = [];
    eventMap.set(handler, handlerArray);
  }

  handlerArray.push(proxied);
}

class Behavior {
  constructor(target, settings) {
    initListeners(this);

    this._target = target;

    settings = _.merge({}, DEFAULTS, settings);

    if (settings.disabled) {
      this.disable();
    } else {
      this.enable();
    }

    this._enabledEvaluator = this._enabledEvaluator.bind(this);
  }

  disable() {
    this._disabled = true;
  }

  enable() {
    this._disabled = false;
  }

  _enabledEvaluator() {
    return !this._disabled;
  }

  _listenTo(source, event, handler) {
    const functionProxy = FunctionProxy.get(handler, this._enabledEvaluator, this._target);

    setListener(this, source, event, handler, functionProxy);
    source.addEventListener(event, functionProxy, false);
  }

  _unlistenTo(source, event, handler) {
    const handlers = getHandlerArray(this, source, event, handler) || [];

    handlers.forEach((listener) => source.removeEventListener(event, listener));
    clearHandlerArray(this, source, event, handler);
  }

  // eslint-disable-next-line class-methods-use-this
  attachBehavior() {
    throw new Error('attachBehavior(): This method should be implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  detachBehavior() {
    throw new Error('detachBehavior(): This method should be implemented');
  }
}

export default Behavior;
