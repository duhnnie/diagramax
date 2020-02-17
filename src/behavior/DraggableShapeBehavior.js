import _ from 'lodash';
import DragBehavior from './DragBehavior';
import Shape from '../shape/Shape';

export const EVENT = Object.freeze({
  START: 'dragstart',
  DRAG: 'drag',
  END: 'dragend',
});
class DraggableShapeBehavior extends DragBehavior {
  constructor(target, settings) {
    if (!(target instanceof Shape)) {
      throw new Error('DraggableShapeBehavior: The settings parameter should be an instance of Shape');
    }

    super(target, settings);

    this._onGrab = this._onGrab.bind(this);
  }

  _onGrab(event) {
    const canvas = this._target.getCanvas();

    super._onGrab(event);

    canvas.setDraggingShape(this._target);
  }

  _onStart(point) {
    // TODO: When Element inherits from EventTarget, the method
    // should trigger the event from itself.
    this._target.getCanvas().dispatchEvent(EVENT.START, this._target);
    super._onStart(point);
  }

  _onDrag(point) {
    this._target.getCanvas().dispatchEvent(EVENT.DRAG, this._target);
    super._onDrag(point);
  }

  _onEnd(point) {
    this._target.getCanvas().dispatchEvent(EVENT.END, this._target);
    super._onEnd(point);
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate() {
    throw new Error('evaluate(): This method should be implemented.');
  }

  updatePosition(position) {
    if (!this._lastPosition) {
      this._lastPosition = this._target.getPosition();
    }

    super.updatePosition(position);
  }

  attachBehavior() {
    this._target._getMainElement().addEventListener('mousedown', this._onGrab, false);
    this._target._getMainElement().addEventListener('click', this._onRelease, false);
  }
}

export default DraggableShapeBehavior;
