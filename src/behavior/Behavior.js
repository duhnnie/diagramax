import _ from 'lodash';

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

  disable() {
    this._disabled = true;
  }

  enable() {
    this._disabled = false;
  }
}

export default Behavior;
