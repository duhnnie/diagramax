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

  _updateSize(width, height) {
    const { mainElement } = this._dom;
    const diameter = Math.min(width, height);

    if (mainElement) {
      mainElement.setAttribute('r', diameter / 2);
    }

    super._updateSize(diameter, diameter);
  }

  _updateWidth(width) {
    this._updateSize(width, width);
  }

  _updateHeight(height) {
    this._updateSize(height, height);
  }

  setRadius(radius) {
    const diameter = radius * 2;

    return this.setSize(diameter, diameter);
  }

  setWidth(width) {
    return this.setSize(width, width);
  }

  setHeight(height) {
    return this.setSize(height, height);
  }

  getRadius() {
    return this._radius;
  }

  _mapSize(width, height) {
    this._radius = Math.min(width, height) / 2;
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
