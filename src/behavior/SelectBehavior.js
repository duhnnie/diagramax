import Behavior from './Behavior';

/**
 * Enum for Selection events.
 * @readonly
 * @enum {String}
 */
export const EVENT = Object.freeze({
  /** A Shape is selected. */
  SELECT: 'select',
  UNSELECT: 'unselect',
});

/**
 * Gifts a Shape the ability to be selected.
 * @extends Behavior
 */
class SelectBehavior extends Behavior {
  constructor(target, options) {
    super(target, options);

    this._isSelected = false;
    // We proxy the start() and _select() method (and not the unselect()) cause the two formers are
    // the method that make the behavior to perform, so their execution need to be controlled based
    // on if the behavior is enabled or not.
    this.start = this._bind(this.start);
    this._select = this._bind(this._select);
  }

  end() {
    this.unselect();
  }

  /**
   * Determines if the current target is selected.
   * @returns {Boolean}
   */
  isSelected() {
    return this._isSelected;
  }

  /**
   * Selects the behavior target element.
   */
  _select(addMethod) {
    if (!this._isSelected) {
      const target = this._target;

      if (addMethod(target)) {
        const canvas = target.getCanvas();

        this._isSelected = true;
        target._controlsLayer.setActive();
        canvas.dispatchEvent(EVENT.SELECT, target);
      }
    }
  }

  /**
   * Unselects the behavior target element.
   */
  unselect() {
    if (this._isSelected) {
      const target = this._target;
      const canvas = target.getCanvas();

      this._isSelected = false;
      // TODO: fix this access to a protected member.
      target._controlsLayer.setActive(false);
      canvas.dispatchEvent(EVENT.UNSELECT, target);
    }
  }

  start() {
    if (!this._isSelected) {
      const target = this._target;

      target.getCanvas().selectItem(target);
    }
  }

  /**
   * @inheritdoc
   */
  attachBehavior() {
    this._target.getHTML().addEventListener('mousedown', this.start, false);
  }

  detachBehavior() {
    this._target.getHTML().removeEventListener('mousedown', this.start, false);
    super.detachBehavior();
  }
}

export default SelectBehavior;
