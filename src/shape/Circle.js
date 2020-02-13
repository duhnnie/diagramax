import Element from '../core/Element';
import Shape from './Shape';

const DEFAULTS = Object.freeze({
  width: 60,
  height: 60,
});

class Circle extends Shape {
  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);
  }

  _createHTML() {
    if (!this._html) {
      const circle = Element.createSVG('circle');

      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('r', this._width * 0.5);
      circle.setAttribute('fill', '#ffffff');
      circle.setAttribute('stroke', '#000000');
      circle.setAttribute('stroke-width', '4');

      this._dom.mainElement = circle;

      super._createHTML();
    }

    return this;
  }
}

export default Circle;
