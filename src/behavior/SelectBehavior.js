import Behavior from './Behavior';

/**
 * Enum for Selection events.
 * @readonly
 * @enum {String}
 */
export const EVENT = Object.freeze({
  /** A Shape is selected. */
  SELECT: 'select',
  DESELECT: 'deselect',
});

/**
 * Gifts a Shape the ability to be selected.
 * @extends Behavior
 */
class SelectBehavior extends Behavior {
  constructor(target, options) {
    super(target, options);

    this._isSelected = false;
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
  select() {
    if (!this._isSelected) {
      const canvas = this._target.getCanvas();

      this._isSelected = true;
      // TODO: fix this access to a protected member.
      this._target._controlsLayer.setActive();
      canvas.dispatchEvent(EVENT.SELECT, this._target);
    }
  }

  /**
   * Deselects the behavior target element.
   */
  deselect() {
    if (this._isSelected) {
      const canvas = this._target.getCanvas();

      this._isSelecte = false;
      // TODO: fix this access to a protected member.
      this._target._controlsLayer.setActive(false);
      canvas.dispatchEvent(EVENT.DESELECT, this._target);
    }
  }

  /**
   * @inheritdoc
   */
  attachBehavior() {
    this._target.getHTML().addEventListener('click', () => {
      this.select();
    }, false);
  }
}

export default SelectBehavior;
