import Element from '../core/Element';
import Shape from './Shape';

const DEFAULTS = {
  width: 80,
  height: 80,
};

class Box extends Shape {
  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);
  }

  _createHTML() {
    if (!this._html) {
      const rect = Element.createSVG('rect');

      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#000000');
      rect.setAttribute('width', this._width);
      rect.setAttribute('height', this._height);
      rect.setAttribute('rx', 4);
      rect.setAttribute('ry', 4);
      rect.setAttribute('stroke-width', 4);
      rect.setAttribute('stroke-dasharray', 0);
      rect.setAttribute('transform', `translate(${this._width / -2}, ${this._height / -2})`);

      super._createHTML();

      this._dom.textContent.setAttribute('y', '0.3em');
      this._dom.text.setAttribute('transform', 'translate(0, 0)');
      this._dom.shapeElement = rect;

      this._html.insertBefore(rect, this._dom.title);
    }

    return this;
  }
}
export default Box;
