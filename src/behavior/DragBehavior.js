import Behavior from './Behavior';

class DragBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dragging = false;
    this._grabbed = false;

    this._onGrab = this._bind(this._onGrab);
    this.startDrag = this._bind(this.startDrag);
    this._onRelease = this._onRelease.bind(this);
  }

  _onGrab(event) {
    const { clientX: x, clientY: y } = event;

    this._grabbed = true;

    // TODO: Do we use _lastPosition?
    this._lastPosition = this._target.getCanvas().clientToCanvas({ x, y });
  }

  // eslint-disable-next-line no-unused-vars
  startDrag(position) {
    if (!this._dragging) {
      this._dragging = true;
    }
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  updatePosition(position, options, modifiers) {}

  endDrag(event) {
    if (event) event.stopPropagation();

    this._grabbed = false;
    this._dragging = false;
  }

  end() {
    this.endDrag();
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
