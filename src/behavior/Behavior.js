import _ from 'lodash';
import FunctionProxy from '../utils/FunctionProxy';

const DEFAULTS = Object.freeze({
  disabled: false,
});

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

  _enabledEvaluator() {
    return !this._disabled;
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
    return FunctionProxy.get(handler, '_enabledEvaluator', this);
  }

  disable() {
    this._disabled = true;
  }

  enable() {
    this._disabled = false;
  }

  // eslint-disable-next-line class-methods-use-this
  attachBehavior() {
    throw new Error('attachBehavior(): This method should be implemented');
  }

  // eslint-disable-next-line class-methods-use-this
  detachBehavior() {
    throw new Error('attachBehavior(): This method should be implemented');
  }
}

export default Behavior;
