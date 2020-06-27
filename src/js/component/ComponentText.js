import BaseElement from '../core/BaseElement';

const DEFAULTS = {
  text: '',
};

class ComponentText extends BaseElement {
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
   * Sets the text to the ComponentText
   * @param {String} text The text to set.
   */
  setText(text) {
    this._text = text.toString().trim();

    if (this._dom.textContainer) {
      const { textContainer } = this._dom;

      if (this._text) {
        textContainer.textContent = text;
      } else {
        textContainer.innerHTML = '&nbsp;&nbsp;&nbsp;';
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
    const wrapper = BaseElement.createSVG('g');
    const text = BaseElement.createSVG('text');
    const tspan = BaseElement.createSVG('tspan');

    // TODO: move to CSS file
    tspan.style.userSelect = 'none';
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('y', '0.5em');
    wrapper.setAttribute('pointer-events', 'none');
    wrapper.appendChild(text);
    text.appendChild(tspan);

    this._dom.textContainer = tspan;
    this.setText(this._text);

    this._html = wrapper;

    return this;
  }
}

export default ComponentText;
