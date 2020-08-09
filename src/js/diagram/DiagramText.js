import BaseElement from '../core/BaseElement';

const DEFAULTS = {
  text: '',
};

class DiagramText extends BaseElement {
  static get type() {
    return 'diagramText';
  }

  constructor(settings) {
    super(settings);

    this._text = '';
    this._dom = {};

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this.setText(settings.text);
  }

  /**
   * Sets the text to the DiagramText
   * @param {String} text The text to set.
   */
  setText(text) {
    this._text = text.toString().trim();

    if (this._dom.textContainer) {
      const { textContainer } = this._dom;

      if (this._text) {
        textContainer.textContent = text;
      } else {
        textContainer.innerHTML = '';
      }
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
    const text = BaseElement.createSVG('text');
    const tspan = BaseElement.createSVG('tspan');

    text.classList.add('text');
    tspan.classList.add('text-container');
    text.appendChild(tspan);

    this._dom.textContainer = tspan;
    this.setText(this._text);
    this._html = text;

    return super._createHTML();
  }
}

export default DiagramText;
