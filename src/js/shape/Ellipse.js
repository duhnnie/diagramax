import BaseElement from '../core/BaseElement';
import Shape from './Shape';

const DEFAULTS = {
  radiusX: 50,
  radiusY: 40,
};

class Ellipse extends Shape {
  static get type() {
    return 'ellipse';
  }

  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);

    this._radiusX = null;
    this._radiusY = null;

    this.setSize(settings.radiusX, settings.radiusY);
  }

  _updateSize(width, height) {
    const { ellipse } = this._dom;

    this._cWidth = width;
    this._cHeight = height;

    if (ellipse) {
      ellipse.setAttribute('rx', this._cWidth / 2);
      ellipse.setAttribute('ry', this._cHeight / 2);
    }
  }

  // TODO: this method is pretty similar to the one in Rectangle, Triangle
  setRadiusX(radiusX) {
    const height = this.getHeight();

    return this.setSize(radiusX * 2, height);
  }

  getRadiusX() {
    return this._radiusX;
  }

  setWidth(width) {
    return this.setRadiusX(width / 2);
  }

  // TODO: this method is pretty similar to the one in Rectangle, Triangle
  setRadiusY(radiusY) {
    const width = this.getWidth();

    return this.setSize(width, radiusY * 2);
  }

  getRadiusY() {
    return this._radiusY;
  }

  setHeight(height) {
    return this.setRadiusY(height / 2);
  }

  _mapSize(width, height) {
    this._radiusX = width / 2;
    this._radiusY = height / 2;
  }

  getBounds() {
    const { _x: x, _y: y, _radiusX, _radiusY } = this;

    return {
      top: y - _radiusY,
      right: x + _radiusX,
      bottom: y + _radiusY,
      left: x - _radiusX,
    };
  }

  _createHTML() {
    if (!this._html) {
      const ellipse = BaseElement.createSVG('ellipse');

      super._createHTML();

      ellipse.setAttribute('cx', 0);
      ellipse.setAttribute('cy', 0);

      this._dom.ellipse = ellipse;
      this._getMainElement().append(ellipse);
      this.setSize(this._radiusX * 2, this._radiusY * 2);
    }

    return this;
  }
}

export default Ellipse;
