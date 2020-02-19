import Element from '../core/Element';
import Behavior from './Behavior';

/**
 * @private
 * @static
 * @type {ShapeText}
 * The current ShapeText that is in edition.
 */
let currentShapeText = null;
/**
 * @private
 * @static
 * @type {SVGElement}
 * The foreingObject wrapper that wraps the input text element.
 */
const wrapper = Element.createSVG('foreignObject');
/**
 * @private
 * @static
 * @type {HTMLInputElement}
 * The input text element for enter the text for the shape.
 */
const inputText = document.createElementNS('http://www.w3.org/1999/xhtml', 'input');

inputText.type = 'text';
wrapper.setAttribute('class', 'shape-text-input');
wrapper.setAttribute('width', 100);
wrapper.setAttribute('height', 30);
wrapper.appendChild(inputText);

/**
 * @private
 * Updates the text in the ShapeText that currently has in edition mode.
 * @param {Event} A change event comming from the input.
 */
const updateText = (event) => {
  currentShapeText.setText(event.target.value);
  wrapper.remove();
};

/**
 * @private
 * Hides the text input.
 */
const removeInput = () => wrapper.remove();

/**
 * @private
 * Handles the keyboard events on the input text element.
 * @param {KeyboardEvent} event
 */
const onKeyDown = (event) => {
  let code;

  if (event.code !== undefined) {
    code = event.code;
  } else if (event.keyCode !== undefined) {
    code = event.keyCode === 27 ? 'Escape' : '';
  }

  if (code === undefined) return;

  switch (code) {
    case 'Escape':
      inputText.value = currentShapeText.getText();
      removeInput();
      break;
    default:
  }
};

inputText.addEventListener('change', updateText, false);
inputText.addEventListener('keydown', onKeyDown, false);
inputText.addEventListener('blur', removeInput, false);

/**
 * Class that contains the beahvior for edit a ShapeText.
 * @extends Behavior
 */
class EditableTextBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._onEnterEditAction = this._onEnterEditAction.bind(this);
  }

  _onEnterEditAction(event) {
    const { _target } = this;

    event.stopPropagation();

    currentShapeText = _target;
    inputText.value = _target.getText();
    _target.getHTML().appendChild(wrapper);
    inputText.select();
  }

  /**
   * @inheritdoc
   */
  attachBehavior() {
    const { _target: target } = this;

    target.getHTML().addEventListener('dblclick', this._onEnterEditAction, false);
  }
}

export default EditableTextBehavior;
