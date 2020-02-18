import Element from '../core/Element';
import Shape from './Shape';

const DEFAULTS = Object.freeze({
  radius: 30,
});

class Circle extends Shape {
  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);

    this._radius = null;

    this.setRadius(settings.radius);
  }

  setRadius(radius) {
    const { mainElement } = this._dom;

    this._radius = radius;

    if (mainElement) {
      mainElement.setAttribute('r', radius);
    }

    return this;
  }

  getRadius() {
    return this._radius;
  }

  setSize(width, height) {
    this.setRadius(Math.max(width, height));
  }

  adjustSize(boundingBox) {
    const { top, right, bottom, left } = boundingBox;
    const width = (right - left) / 2;
    const height = (bottom - top) / 2;

    this.setSize(width, height);
  }

  getBounds() {
    const { _x: x, _y: y, _radius: radius } = this;

    return {
      top: y - radius,
      right: x + radius,
      bottom: y + radius,
      left: x - radius,
    };
  }

  _createHTML() {
    if (!this._html) {
      const circle = Element.createSVG('circle');

      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('fill', '#ffffff');
      circle.setAttribute('stroke', '#000000');
      circle.setAttribute('stroke-width', '4');

      this._dom.mainElement = circle;

      this.setRadius(this._radius);

      super._createHTML();
    }

    return this;
  }
}

export default Circle;
