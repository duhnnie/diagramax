import _ from 'lodash';
import Element from '../core/Element';

const DEFAULTS = {
  text: '',
};

class ShapeText extends Element {
  constructor(settings) {
    super(settings);

    this._text = '';
    this._dom = {};

    settings = _.merge({}, DEFAULTS, settings);

    this.setText(settings.text);
  }

  /**
   * Sets the text to the ShapeText
   * @param {String} text The text to set.
   */
  setText(text) {
    this._text = text.toString();

    if (this._dom.textContainer) {
      this._dom.textContainer.textContent = text;
    }
  }

  /**
   * Returns the object's text.
   * @returns {String}
   */
  getText() {
    return this._text;
  }

  /**
   * @inheritdoc
   */
  _createHTML() {
    const text = Element.createSVG('text');
    const tspan = Element.createSVG('tspan');

    // TODO: move to CSS file
    tspan.style.pointerEvents = 'none';
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('y', '0.5em');
    text.appendChild(tspan);

    this._dom.textContainer = tspan;
    this.setText(this._text);

    this._html = text;

    return this;
  }
}

export default ShapeText;
