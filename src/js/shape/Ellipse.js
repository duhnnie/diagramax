import Element from '../core/Element';
import Shape from './Shape';

const DEFAULTS = {
  radiusX: 100,
  radiusY: 80,
};

class Ellipse extends Shape {
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
    const { mainElement } = this._dom;

    this._cWidth = width;
    this._cHeigth = height;

    if (mainElement) {
      mainElement.setAttribute('rx', this._cWidth / 2);
      mainElement.setAttribute('ry', this._cHeigth / 2);
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

  setWidth(width, keepProportion) {
    return this.setRadiusX(width / 2, keepProportion);
  }

  // TODO: this method is pretty similar to the one in Rectangle, Triangle
  setRadiusY(radiusY) {
    const width = this.getWidth();

    return this.setSize(width, radiusY * 2);
  }

  getRadiusY() {
    return this._radiusY;
  }

  setHeight(height, keepProportion) {
    return this.setRadiusY(height / 2, keepProportion);
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
      const ellipse = Element.createSVG('ellipse');

      ellipse.setAttribute('cx', 0);
      ellipse.setAttribute('cy', 0);
      ellipse.setAttribute('fill', '#ffffff');
      ellipse.setAttribute('stroke', '#000000');
      ellipse.setAttribute('stroke-width', '4');

      this._dom.mainElement = ellipse;
      this.setSize(this._radiusX, this._radiusY);

      super._createHTML();
    }

    return this;
  }
}

export default Ellipse;
