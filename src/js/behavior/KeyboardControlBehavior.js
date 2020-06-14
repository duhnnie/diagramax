import Behavior from './Behavior';

class KeyboardControlBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._onKeyDown = this._bind(this._onKeyDown);
  }

  _onKeyDown(event) {
    const { _target } = this;

    // TODO: Is there a native constant for this?
    switch (event.code) {
      case 'Delete':
        // TODO: this could be a Canvas' function, like removeSelection();
        _target.getSelection().forEach((element) => _target.removeElement(element));
        break;
      case 'Escape':
        // TODO: this could be a Canvas' method, like endCurrentProcess():
        _target._draggingAreaBehavior.end();
        _target._connectivityAreaBehavior.end();
        _target._selectionBehavior.end();
        break;
      case 'KeyZ':
        if (event.ctrlKey) {
          if (event.shiftKey) {
            _target.redo();
          } else {
            _target.undo();
          }
        }
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
