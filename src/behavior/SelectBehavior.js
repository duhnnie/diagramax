import Behavior from './Behavior';

/**
 * Enum for Selection events.
 * @readonly
 * @enum {String}
 */
const EVENTS = Object.freeze({
  /** A Shape is selected. */
  SELECT: 'select',
});

/**
 * Gifts a Shape the ability to be selected.
 * @extends Behavior
 */
class SelectBehavior extends Behavior {
  /**
   * @protected
   * Method that defines what to do when the action for select the shape is performed.
   */
  _onSelectAction() {
    const canvas = this._target.getCanvas();

    canvas.dispatchEvent(EVENTS.SELECT, this._target);
  }

  /**
   * @inheritdoc
   */
  attachBehavior() {
    this._target.getHTML().addEventListener('click', () => {
      this._onSelectAction();
    }, false);
  }
}

export default SelectBehavior;
