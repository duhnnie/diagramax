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

  _updateSize() {
    const { mainElement } = this._dom;

    if (mainElement) {
      mainElement.setAttribute('r', this._radius);
    }
  }

  setRadius(radius) {
    const size = this.getSize();

    this._radius = radius;

    if (!this.__bulkAction) {
      this._updateSize();
      this._sizeHasChanged(size);
    }

    return this;
  }

  setWidth(width) {
    return this.setRadius(width / 2);
  }

  setHeight(height) {
    return this.setRadius(height / 2);
  }

  getRadius() {
    return this._radius;
  }

  setSize(width, height) {
    this.setWidth(Math.min(width, height));
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
