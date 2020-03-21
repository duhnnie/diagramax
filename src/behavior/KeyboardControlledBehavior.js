import Behavior from './Behavior';

class KeyboardControlledBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._onKeyDown = this._bind(this._onKeyDown);
  }

  _onKeyDown(event) {
    // TODO: Is there a native constant for this?
    if (event.code === 'Delete') this._target.remove();
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('keydown', this._onKeyDown, false);
    super.attachBehavior();
  }

  detachBehavior() {
    this._target.getHTML().addEventListener('keydown', this._onKeyDown);
    super.detachBehavior();
  }
}

export default KeyboardControlledBehavior;
