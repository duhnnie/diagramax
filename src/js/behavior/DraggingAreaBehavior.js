import Behavior from './Behavior';

class DraggingAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this.removeDragBehavior();
    this._onMouseMove = this._bind(this._onMouseMove);
    this._onClick = this._onClick.bind(this);
  }

  removeDragBehavior() {
    const dragBehavior = this._dragBehavior;

    this._dragBehavior = null;
    this._behaviorOptions = null;
    this._started = false;

    if (dragBehavior) dragBehavior.endDrag();
  }

  setDragBehavior(behavior, options = {}) {
    if (behavior !== this._dragBehavior) {
      // TODO: find a better way to access the shape behavior, it's a protected member.
      this.removeDragBehavior();
      this._dragBehavior = behavior;
      this._behaviorOptions = { ...options };
      behavior.getTarget().select();
    }
  }

  _onMouseMove(event) {
    if (this._dragBehavior) {
      const { clientX, clientY } = event;
      const { x, y } = this._target.clientToCanvas({ x: clientX, y: clientY });
      const position = this.evaluate(x, y);

      if (!this._started) {
        this._started = true;
        this._dragBehavior.startDrag(position, this._behaviorOptions);
      }

      if (position) {
        const modifiers = {
          altKey: event.altKey,
          ctrlKey: event.ctrlKey,
          metaKey: event.metaKey,
          shiftKey: event.shiftKey,
        };

        // TODO: consider to update this method to send the actual position instead of the diff.
        this._dragBehavior.updatePosition(position, this._behaviorOptions, modifiers);
      }
    }
  }

  _onClick() {
    this.removeDragBehavior();
  }

  end() {
    this.removeDragBehavior();
  }

  attach() {
    const { _target } = this;

    _target.getHTML().addEventListener('mousemove', this._onMouseMove, false);
    _target.getHTML().addEventListener('click', this._onClick, false);

    return this;
  }

  detach() {
    const { _target } = this;

    _target.getHTML().removeEventListener('mousemove', this._onMouseMove, false);
    _target.getHTML().removeEventListener('click', this._onClick, false);

    super.detach();
  }

  // TODO: this is the method in which snapping could be applied.
  // eslint-disable-next-line class-methods-use-this
  evaluate(diffX, diffY) {
    return {
      x: diffX,
      y: diffY,
    };
  }
}

export default DraggingAreaBehavior;
