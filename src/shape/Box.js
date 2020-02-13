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
      rect.setAttribute('x', this._width * -0.5);
      rect.setAttribute('y', this._height * -0.5);
      rect.setAttribute('width', this._width);
      rect.setAttribute('height', this._height);
      rect.setAttribute('stroke-width', 4);
      rect.setAttribute('stroke-dasharray', 0);

      this._dom.mainElement = rect;

      super._createHTML();
    }

    return this;
  }
}
export default Box;
