import _ from 'lodash';
import Behavior from './Behavior';

const DEFAULTS = Object.freeze({
  onStart: _.noop,
  onDrag: _.noop,
  onEnd: _.noop,
});

class DragBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dragging = false;
    this._grabbed = false;
    this._diff = {
      x: 0,
      y: 0,
    };

    this._options = {
      ...DEFAULTS,
      ...settings,
    };

    this._lastPosition = null;
    this._onGrab = this._onGrab.bind(this);
    this._onRelease = this._onRelease.bind(this);
  }

  _onStart(point) {
    this._options.onStart(point);
  }

  _onDrag(point) {
    this._options.onDrag(point);
  }

  _onEnd(point) {
    this._options.onEnd(point);
  }

  _onGrab(event) {
    const { clientX: x, clientY: y } = event;

    this._grabbed = true;

    this._lastPosition = this._target.getCanvas().clientToCanvas({ x, y });
  }

  startDrag(position) {
    if (!this._dragging) {
      this._dragging = true;
      this._onStart(position);
    }
  }

  updatePosition({ x, y }) {
    this._onDrag({ x, y });
  }

  endDrag(event) {
    const canvas = this._target.getCanvas();

    if (event) event.stopPropagation();

    canvas.setDraggingShape(null);
    this._grabbed = false;
    if (this._dragging) {
      this._dragging = false;
      this._onEnd(this._target.getPosition());
    }
  }

  _onRelease() {
    if (this._grabbed || this._dragging) {
      this.endDrag();
    }
  }

  isDragging() {
    return this._dragging;
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate() {
    throw new Error('evaluate(): This method should be implemented.');
  }
}

export default DragBehavior;
