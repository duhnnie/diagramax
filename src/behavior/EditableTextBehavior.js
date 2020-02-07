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
 * @protected
 * Updates the text in the ShapeText that currently has in edition mode.
 * @param {Event} A change event comming from the input.
 */
const updateText = (event) => {
  const { value } = event.target;

  currentShapeText.setText(value);
  wrapper.remove();
};

inputText.addEventListener('change', updateText, false);

/**
 * Class that contains the beahvior for edit a ShapeText.
 * @extends Behavior
 */
class EditableTextBehavior extends Behavior {
  /**
   * @inheritdoc
   */
  attachBehavior() {
    const { _target: target } = this;

    target.getHTML().addEventListener('dblclick', () => {
      currentShapeText = target;
      inputText.value = target.getText();
      target.getHTML().appendChild(wrapper);
      inputText.select();
    }, false);
  }
}

export default EditableTextBehavior;
