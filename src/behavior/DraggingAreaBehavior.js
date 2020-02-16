import Behavior from './Behavior';

class DraggingAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dragBehavior = null;
    this._lastPosition = null;
    this._onMouseMove = this._onMouseMove.bind(this);
  }

  removeDragBehavior() {
    const dragBehavior = this._dragBehavior;

    this._dragBehavior = null;

    if (dragBehavior) dragBehavior.endDrag();
  }

  setDragBehavior(behavior, initDragPoint) {
    const { x = null, y = null } = initDragPoint || {};

    // TODO: find a better way to access the shape behavior, it's a protected member.
    this.removeDragBehavior();
    this._dragBehavior = behavior;

    this._lastPosition = { x, y };
  }

  _onMouseMove(event) {
    if (!this._disabled && this._dragBehavior) {
      const diffX = event.clientX - this._lastPosition.x;
      const diffY = event.clientY - this._lastPosition.y;
      const diffs = this.evaluate(diffX, diffY);

      if (diffs) {
        // TODO: consider to update this method to send the actual position instead of the diff.
        this._dragBehavior.updatePosition(diffs);
        this._lastPosition.x = event.clientX;
        this._lastPosition.y = event.clientY;
      }
    }
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('mousemove', this._onMouseMove, false);

    return this;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  evaluate(diffX, diffY, next) {
    // This method should be override in subclasses.
  }
}

export default DraggingAreaBehavior;
