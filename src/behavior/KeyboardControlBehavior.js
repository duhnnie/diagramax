import Behavior from './Behavior';

class KeyboardControlBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._onKeyDown = this._bind(this._onKeyDown);
  }

  _onKeyDown(event) {
    // TODO: Is there a native constant for this?
    switch (event.code) {
      case 'Delete':
        this._target.getSelection().forEach((element) => element.remove());
        break;
      case 'Escape':
        this._target._draggingAreaBehavior.end();
        this._target._connectivityAreaBehavior.end();
        this._target._selectionBehavior.end();
        break;
      default:
    }
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('keydown', this._onKeyDown, false);
    super.attachBehavior();
  }

  detachBehavior() {
    this._target.getHTML().removeEventListener('keydown', this._onKeyDown, false);
    super.detachBehavior();
  }
}

export default KeyboardControlBehavior;
