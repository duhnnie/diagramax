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

    // TODO: A way to get rid of _diff approach would be to get relative canvas pos.
    this._diff = {
      x: 0,
      y: 0,
    };
    this._lastPosition = null;

    this.updatePosition = this._bind(this.updatePosition);
  }

  _onGrab(event) {
    const canvas = this._target.getCanvas();

    super._onGrab(event);

    canvas.setDraggingShape(this._target);
  }

  startDrag(point) {
    if (!this._dragging) {
      super.startDrag(point);
      // TODO: When Element inherits from EventTarget, the method
      // should trigger the event from itself.
      this._target.getCanvas().dispatchEvent(EVENT.START, this._target);
    }
  }

  endDrag(event) {
    if (this._grabbed || this._dragging) {
      const { _target } = this;
      const canvas = _target.getCanvas();

      super.endDrag(event);
      canvas.setDraggingShape(null);
      canvas.dispatchEvent(EVENT.END, _target);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate() {
    throw new Error('evaluate(): This method should be implemented.');
  }

  updatePosition({ x, y }) {
    if (!this._lastPosition) {
      this._lastPosition = this._target.getPosition();
    }

    this._diff.x += x - this._lastPosition.x;
    this._diff.y += y - this._lastPosition.y;

    const diff = this._evaluate(this._diff.x, this._diff.y);

    if (diff) {
      const target = this._target;
      let { x: posX, y: posY } = target.getPosition();

      posX += this._diff.x;
      posY += this._diff.y;

      this._lastPosition = { x, y };
      this._diff.x = 0;
      this._diff.y = 0;

      this._target.setPosition(posX, posY);
    }

    super.updatePosition({ x, y });
    this._target.getCanvas().dispatchEvent(EVENT.DRAG, this._target);
  }

  attachBehavior() {
    const { _target } = this;

    _target._getMainElement().addEventListener('mousedown', this._onGrab, false);
    _target._getMainElement().addEventListener('click', this._onRelease, false);
  }

  detachBehavior() {
    const { _target } = this;

    _target._getMainElement().removeEventListener('mousedown', this._onGrab, false);
    _target._getMainElement().removeEventListener('click', this._onRelease, false);
  }
}

export default DraggableShapeBehavior;
