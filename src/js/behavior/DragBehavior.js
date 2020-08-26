import Behavior from './Behavior';
import ErrorThrower from '../utils/ErrorThrower';

const DRAGGABLE_CN = 'draggable';
const GRABBING_CN = 'grabbing';
const DRAGGING_CN = 'dragging';

class DragBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dragging = false;
    this._grabbed = false;

    this._onGrab = this._bind(this._onGrab);
    this.startDrag = this._bind(this.startDrag);
    this._onRelease = this._onRelease.bind(this);
  }

  disable() {
    super.disable();
    this._getDraggableElement().forEach((element) => element.classList.remove(DRAGGABLE_CN));
  }

  _onGrab(event) {
    // TODO: all child classes have this line on its _onGrab method.
    // Find a way to not repeat this in all of them.
    if (event.button !== 0) return;

    this._grabbed = true;
    this._getDraggableElement().forEach((element) => element.classList.add(GRABBING_CN));
  }

  // eslint-disable-next-line no-unused-vars
  startDrag(position) {
    if (!this._dragging) {
      this._dragging = true;
    }

    this._target.getElement().classList.add(DRAGGING_CN);
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  updatePosition(position, options, modifiers) {}

  endDrag(event) {
    if (event) event.stopPropagation();

    this._grabbed = false;
    this._dragging = false;
    this._target.getElement().classList.remove(DRAGGING_CN);
    this._getDraggableElement().forEach((element) => element.classList.remove(GRABBING_CN));
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
    ErrorThrower.notImplemented();
  }

  _getDraggableElement() {
    return [this._target.getElement()];
  }

  attach() {
    super.attach();
    this._getDraggableElement().forEach((element) => element.classList.add(DRAGGABLE_CN));
  }
}

export default DragBehavior;
