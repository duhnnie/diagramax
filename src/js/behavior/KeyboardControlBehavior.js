import Behavior from './Behavior';
import { PRODUCTS as COMMANDS } from '../command/CommandFactory';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';

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
        // TODO: Maybe all keyboard events should call to already implemented functions.
        // TODO: this could be a Canvas' function, like removeSelection();
        _target.getSelection().forEach((element) => {
          let elementToRemove;
          let commandType;

          if (element instanceof Shape) {
            elementToRemove = _target.findShape(element);
            commandType = COMMANDS.SHAPE_REMOVE;
          } else if (element instanceof Connection) {
            elementToRemove = _target.findConnection(element);
            commandType = COMMANDS.CONNECTION_REMOVE;
          }

          if (elementToRemove) {
            _target.executeCommand(commandType, elementToRemove);
          }
        });
        break;
      case 'Escape':
        // TODO: this could be a Canvas' method, like endCurrentProcess():
        _target._draggingAreaBehavior.end();
        _target._connectivityAreaBehavior.end();
        _target._selectionBehavior.end();
        break;
      default:
    }
  }

  attach() {
    this._target.getElement().addEventListener('keydown', this._onKeyDown, false);
    super.attach();
  }

  detach() {
    this._target.getElement().removeEventListener('keydown', this._onKeyDown, false);
    super.detach();
  }
}

export default KeyboardControlBehavior;
