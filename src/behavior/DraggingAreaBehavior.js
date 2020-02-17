import Behavior from './Behavior';

class DraggingAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dragBehavior = null;
    this._behaviorOptions = null;
    this._onMouseMove = this._onMouseMove.bind(this);
  }

  removeDragBehavior() {
    const dragBehavior = this._dragBehavior;

    this._dragBehavior = null;
    this._behaviorOptions = null;

    if (dragBehavior) dragBehavior.endDrag();
  }

  setDragBehavior(behavior, options = {}) {
    if (behavior !== this._dragBehavior) {
      // TODO: find a better way to access the shape behavior, it's a protected member.
      this.removeDragBehavior();
      this._dragBehavior = behavior;
      this._behaviorOptions = { ...options };
    }
  }

  _onMouseMove(event) {
    if (!this._disabled && this._dragBehavior) {
      const { clientX: x, clientY: y } = event;
      const position = this.evaluate(x, y);

      if (position) {
        // TODO: consider to update this method to send the actual position instead of the diff.
        this._dragBehavior.updatePosition(position, this._behaviorOptions);
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
