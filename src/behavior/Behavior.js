import _ from 'lodash';
import FunctionProxy from '../utils/FunctionProxy';

const DEFAULTS = Object.freeze({
  disabled: false,
});

const canExecuteBehavior = function() {
  return !this._disabled && this._target;
};

class Behavior {
  constructor(target, settings) {
    this._target = target;

    settings = _.merge({}, DEFAULTS, settings);

    if (settings.disabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  /**
   * Proxies a function to execute it or not depending on the state of the behavior
   * (enabled/disabled). Bind the necessary methods to avoid the behavior to be executed.
   * Even if a Behavior has more than one method that make the behavior to perform, the majority of
   * times it will be enough by proxy just one method.
   * @protected
   * @param {Function} handler The function to be proxied.
   * @returns {Function} The proxied funciton.
   */
  _bind(handler) {
    return FunctionProxy.get(handler, canExecuteBehavior, this);
  }

  disable() {
    this._disabled = true;
  }

  enable() {
    this._disabled = false;
  }

  isDisabled() {
    return this._disabled;
  }

  attachBehavior() {
    this.enable();
  }

  detachBehavior() {
    this._disable();
    this._target = null;
  }
}

export default Behavior;
