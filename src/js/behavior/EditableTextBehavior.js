import Element from '../core/Element';
import Behavior from './Behavior';

/**
 * @private
 * @static
 * @type {ShapeText}
 * @description The current ShapeText that is in edition.
 */
let currentTarget = null;
/**
 * @private
 * @static
 * @type {SVGElement}
 * @description The foreingObject wrapper that wraps the input text element.
 */
const wrapper = Element.createSVG('foreignObject');
/**
 * @private
 * @static
 * @type {HTMLInputElement}
 * @description The input text element for enter the text for the shape.
 */
const inputText = document.createElementNS('http://www.w3.org/1999/xhtml', 'input');

inputText.type = 'text';
wrapper.setAttribute('class', 'shape-text-input');
wrapper.setAttribute('width', 100);
wrapper.setAttribute('height', 30);
wrapper.appendChild(inputText);

/**
 * @private
 * @description Hides the text input.
 */
const removeInput = () => {
  // This due an issue at removing the element when it's already remove.
  // Failed to execute 'remove' on 'Element': The node to be removed is no longer a child of this
  // node. Perhaps it was moved in a 'blur' event handler?
  try {
    wrapper.remove();
  // eslint-disable-next-line no-empty
  } catch (e) {}
};

/**
 * @private
 * @description Updates the text in the ShapeText that currently has in edition mode.
 * @param {Event} A change event comming from the input.
 */
const updateText = (event) => {
  const canvas = currentTarget.getCanvas();

  canvas.setShapeText(currentTarget, event.target.value);
  removeInput();
};

/**
 * @private
 * @description Handles the keyboard events on the input text element.
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
      inputText.value = currentTarget.getText();
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

    this._onEnterEditAction = this._bind(this._onEnterEditAction);
  }

  _onEnterEditAction(event) {
    const { _target } = this;

    event.stopPropagation();

    currentTarget = _target;
    inputText.value = _target.getText();
    _target.getHTML().appendChild(wrapper);
    inputText.select();
  }

  end() {
    if (currentTarget === this._target) {
      removeInput();
    }
  }

  /**
   * @inheritdoc
   */
  attachBehavior() {
    this._target.getHTML().addEventListener('dblclick', this._onEnterEditAction, false);
  }

  /**
   * @inheritdoc
   */
  detachBehavior() {
    this._target.getHTML().removeEventListener('dblclick', this._onEnterEditAction, false);
    super.detachBehavior();
  }
}

export default EditableTextBehavior;
