import DragBehavior from './DragBehavior';
import Shape, { EVENT as SHAPE_EVENT } from '../shape/Shape';
import Geometry from '../utils/Geometry';
import { PRODUCTS as COMMANDS } from '../command/CommandFactory';
import ErrorThrower from '../utils/ErrorThrower';

class DraggableShapeBehavior extends DragBehavior {
  constructor(target, settings) {
    if (!(target instanceof Shape)) {
      ErrorThrower.invalidParameter();
    }

    super(target, settings);

    // TODO: A way to get rid of _diff approach would be to get relative canvas pos.
    this._diff = {
      x: 0,
      y: 0,
    };
    this.updatePosition = this._bind(this.updatePosition);
  }

  _onGrab(event) {
    if (event.button !== 0) return;

    const canvas = this._target.getCanvas();
    const { clientX: x, clientY: y } = event;
    const targetPosition = this._target.getPosition();
    const mousePosition = canvas.clientToCanvas({ x, y });

    super._onGrab(event);

    this._diff.x = mousePosition.x - targetPosition.x;
    this._diff.y = mousePosition.y - targetPosition.y;
    // TODO: can this be generalized in DragBehavior?
    canvas.setDraggingShape(this._target);
  }

  startDrag(point) {
    if (!this._dragging) {
      super.startDrag(point);
      // TODO: When BaseElement inherits from EventTarget, the method
      // should trigger the event from itself.
      this._target.getCanvas().dispatchEvent(SHAPE_EVENT.DRAG_START, this._target);
    }
  }

  endDrag(event) {
    if (this._grabbed || this._dragging) {
      const { _target, _dragging } = this;
      const canvas = _target.getCanvas();

      super.endDrag(event);
      // TODO: Can this be generalized in DragBehavior?
      canvas.setDraggingShape(null);
      if (_dragging) {
        const currentPosition = _target.getCurrentPosition();
        const diff = Geometry.getDiff(_target.getPosition(), currentPosition);

        if (diff.x !== 0 || diff.y !== 0) {
          canvas.executeCommand(COMMANDS.SHAPE_POSITION, _target, currentPosition);
        } else {
          _target.setPosition(currentPosition);
        }

        canvas.dispatchEvent(SHAPE_EVENT.DRAG_END, _target);
      }
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate(diffX, diffY) {
    return {
      diffX,
      diffY,
    };
  }

  updatePosition({ x, y }) {
    const newPosition = {
      x: x - this._diff.x,
      y: y - this._diff.y,
    };

    const target = this._target;
    const canvas = target.getCanvas();

    target._updatePosition(newPosition.x, newPosition.y);

    // TODO: this event should return at least current drag position.
    canvas.dispatchEvent(SHAPE_EVENT.DRAG, this._target, newPosition);

    super.updatePosition({ x, y });
  }

  attach() {
    const { _target } = this;

    _target._getMainElement().addEventListener('mousedown', this._onGrab, false);
    _target._getMainElement().addEventListener('click', this._onRelease, false);
    super.attach();
  }

  detach() {
    const { _target } = this;

    _target._getMainElement().removeEventListener('mousedown', this._onGrab, false);
    _target._getMainElement().removeEventListener('click', this._onRelease, false);
  }
}

export default DraggableShapeBehavior;
