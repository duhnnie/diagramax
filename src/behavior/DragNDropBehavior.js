import _ from 'lodash';
import Behavior from './Behavior';

const DEFAULTS = Object.freeze({
  onStart: _.noop,
  onDrag: _.noop,
  onEnd: _.noop,
});

export const EVENT = Object.freeze({
  START: 'dragstart',
  DRAG: 'drag',
  END: 'dragend',
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

    this._onMouseDown = this._onMouseDown.bind(this);
    this._onClick = this._onClick.bind(this);
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

  _onMouseDown(event) {
    const canvas = this._target.getCanvas();
    const initDragPoint = {
      x: event.clientX,
      y: event.clientY,
    };

    this._grabbed = true;
    canvas.setDraggableShape(this._target, initDragPoint);
  }

  updatePosition({ x, y }) {
    this._diff.x += x;
    this._diff.y += y;

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

      this._onDrag({ posX, posY });
      this._target.setPosition(posX, posY);
      this._diff.x = 0;
      this._diff.y = 0;
    }
  }

  endDrag() {
    const canvas = this._target.getCanvas();

    canvas.setDraggableShape(null);
    this._grabbed = false;
    if (this._dragging) {
      this._dragging = false;
      this._onEnd(this._target.getPosition());
    }
  }

  _onClick() {
    if (this._grabbed || this._dragging) {
      this.endDrag();
    }
  }

  isDragging() {
    return this._dragging;
  }

  attachBehavior() {
    this._target._getMainElement().addEventListener('mousedown', this._onMouseDown, false);
    this._target._getMainElement().addEventListener('click', this._onClick, false);
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate() {
    throw new Error('evaluate(): This method should be implemented.');
  }
}

export default DragAndDropBehavior;
