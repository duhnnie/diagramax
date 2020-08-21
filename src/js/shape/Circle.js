import BaseElement from '../core/BaseElement';
import Shape from './Shape';

const DEFAULTS = Object.freeze({
  radius: 30,
});

class Circle extends Shape {
  static get type() {
    return 'circle';
  }

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
    const { circle } = this._dom;
    const diameter = Math.min(width, height);

    if (circle) {
      circle.setAttribute('r', diameter / 2);
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

  _createElement() {
    if (!this._el) {
      const circle = BaseElement.createSVG('circle');

      super._createElement();

      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);

      this._dom.circle = circle;
      this._getMainElement().append(circle);
      this.setRadius(this._radius);
    }

    return this;
  }
}

export default Circle;
