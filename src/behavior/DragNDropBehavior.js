import _ from 'lodash';
import Behavior from './Behavior';

const DEFAULTS = Object.freeze({
  onStart: _.noop,
  onDrag: _.noop,
  onEnd: _.noop,
});

class DragAndDropBehavior extends Behavior {
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
    this._grabbed = true;

    this._lastPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  updatePosition({ x, y }) {
    this._diff.x += x - this._lastPosition.x;
    this._diff.y += y - this._lastPosition.y;

    const diff = this._evaluate(this._diff.x, this._diff.y);

    if (diff) {
      const target = this._target;
      let { x: posX, y: posY } = target.getPosition();

      posX += this._diff.x;
      posY += this._diff.y;

      if (!this._dragging) {
        this._dragging = true;
        this._onStart(posX, posY);
      }

      this._lastPosition = { x, y };
      this._diff.x = 0;
      this._diff.y = 0;

      this._target.setPosition(posX, posY);
      this._onDrag({ posX, posY });
    }
  }

  endDrag() {
    const canvas = this._target.getCanvas();

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

export default DragAndDropBehavior;
