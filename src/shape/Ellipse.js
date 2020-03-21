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

  _updateSize() {
    const { mainElement } = this._dom;

    if (mainElement) {
      mainElement.setAttribute('rx', this._radiusX);
      mainElement.setAttribute('ry', this._radiusY);
    }
  }

  // TODO: this method is pretty similar to the one in Rectangle, Triangle
  setRadiusX(radiusX, keepProportion = false) {
    if (keepProportion) {
      const radiusY = radiusX / this.getRatio();

      return this.setSize(radiusX, radiusY);
    }

    const size = this.getSize();

    this._radiusX = radiusX;

    if (!this.__bulkAction) {
      this._updateSize();
      this._sizeHasChanged(size);
    }

    return this;
  }

  getRadiusX() {
    return this._radiusX;
  }

  setWidth(width, keepProportion) {
    return this.setRadiusX(width / 2, keepProportion);
  }

  // TODO: this method is pretty similar to the one in Rectangle, Triangle
  setRadiusY(radiusY, keepProportion = false) {
    if (keepProportion) {
      const radiusX = this.getRatio() * radiusY;

      return this.setSize(radiusX, radiusY);
    }

    const size = this.getSize();

    this._radiusY = radiusY;

    if (!this.__bulkAction) {
      this._updateSize();
      this._sizeHasChanged(size);
    }

    return this;
  }

  getRadiusY() {
    return this._radiusY;
  }

  setHeight(height, keepProportion) {
    return this.setRadiusY(height / 2, keepProportion);
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
