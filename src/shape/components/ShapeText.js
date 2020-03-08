import Element from '../../core/Element';
import EditableTextBehavior from '../../behavior/EditableTextBehavior';

const DEFAULTS = {
  text: '',
};

class ShapeText extends Element {
  constructor(settings) {
    super(settings);

    this._text = '';
    this._editableBehavior = new EditableTextBehavior(this);
    this._dom = {};

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this.setText(settings.text);
  }

  /**
   * Sets the text to the ShapeText
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
    const wrapper = Element.createSVG('g');
    const text = Element.createSVG('text');
    const tspan = Element.createSVG('tspan');

    // TODO: move to CSS file
    tspan.style.userSelect = 'none';
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('y', '0.5em');
    wrapper.appendChild(text);
    text.appendChild(tspan);

    this._dom.textContainer = tspan;
    this.setText(this._text);

    this._html = wrapper;
    this._editableBehavior.attachBehavior();

    return this;
  }
}

export default ShapeText;
