import Behavior from './Behavior';
import Shape, { EVENT as SHAPE_EVENT } from '../shape/Shape';

class ConnectivityBehavior extends Behavior {
  constructor(target, settings) {
    if (!(target instanceof Shape)) {
      throw new Error('DragAndDropBehavior: The settings parameter should be an instance of Shape');
    }

    super(target, settings);

    this._onMouseDown = this._bind(this._onMouseDown);
    this._onMouseUp = this._bind(this._onMouseUp);
    this._onConnectionEnter = this._bind(this._onConnectionEnter);
    this._onConnectionLeave = this._bind(this._onConnectionLeave);
    this.end = this.end.bind(this);
  }

  _onMouseDown(event) {
    const target = this._target;

    event.stopPropagation();

    if (!target.isBeingDragged() && event.altKey) {
      target.getCanvas().startConnection(target);
    }
  }

  _onMouseUp(event) {
    const target = this._target;

    event.stopPropagation();

    if (!target.isBeingDragged()) {
      const canvas = target.getCanvas();

      canvas.completeConnection(target);
    }
  }

  _onConnectionEnter(event) {
    const { _target } = this;
    const canvas = _target.getCanvas();

    canvas._connectivityAreaBehavior.enterShape(_target);
  }

  _onConnectionLeave(event) {
    const { _target } = this;
    const canvas = _target.getCanvas();

    canvas._connectivityAreaBehavior.leaveShape(_target);
  }

  end() {
    this._target.getCanvas().getConnectivityAreaBehavior().end();
  }

  attachBehavior() {
    const { _target } = this;
    const canvas = _target.getCanvas();

    _target.getHTML().addEventListener('mousedown', this._onMouseDown, false);
    _target.getHTML().addEventListener('mouseup', this._onMouseUp, false);
    _target.getHTML().addEventListener('mouseenter', this._onConnectionEnter, false);
    _target.getHTML().addEventListener('mouseleave', this._onConnectionLeave, false);
    canvas.addEventListener(SHAPE_EVENT.DRAG_START, _target, this.end);
  }

  detachBehavior() {
    const { _target } = this;
    const canvas = _target.getCanvas();

    _target.getHTML().removeEventListener('mousedown', this._onMouseDown, false);
    _target.getHTML().removeEventListener('mouseup', this._onMouseUp, false);
    _target.getHTML().removeEventListener('mouseenter', this._onConnectionEnter, false);
    _target.getHTML().removeEventListener('mouseleave', this._onConnectionLeave, false);
    canvas.removeEventListener(SHAPE_EVENT.DRAG_START, _target, this.end);
    super.detachBehavior();
  }
}

export default ConnectivityBehavior;
