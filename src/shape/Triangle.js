import Element from '../core/Element';
import Shape from './Shape';
import Geometry from '../utils/Geometry';

const DEFAULTS = Object.freeze({
  base: 80,
  height: 80,
});

class Triangle extends Shape {
  // TODO: Triangle should inherit from a new class Polygon, this method should be belong to that
  // class.
  static toPointsString(points) {
    return points.map(({ x, y }) => `${x},${y}`).join(' ');
  }

  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);

    this._base = null;
    this._height = null;

    this.setSize(settings.base, settings.height);
  }

  setBase(base) {
    const size = this.getSize();

    this._base = base;

    if (!this.__bulkAction) {
      this._updateSize();
      this._sizeHasChanged(size);
    }

    return this;
  }

  getBase() {
    return this._base;
  }

  setHeight(height) {
    const size = this.getSize();

    this._height = height;

    if (!this.__bulkAction) {
      this._updateSize();
      this._sizeHasChanged(size);
    }

    return this;
  }

  getHeight() {
    return this._height;
  }

  setWidth(width) {
    return this.setBase(width);
  }

  _updateShape() {
    const { mainElement } = this._dom;

    if (mainElement) {
      mainElement.setAttribute('points', Triangle.toPointsString(this._getPoints()));
    }

    return this;
  }

  _updateSize() {
    this._updateShape();
  }

  setSize(width, height) {
    super.setSize(width, height);

    return this._updateShape();
  }

  _getPoints() {
    const xPoints = [
      this._base * -0.5,
      0,
      this._base * 0.5,
    ];
    const yPoints = [
      this._height * -0.5,
      this._height * 0.5,
    ];

    return [
      {
        x: xPoints[0],
        y: yPoints[1],
      },
      {
        x: xPoints[1],
        y: yPoints[0],
      },
      {
        x: xPoints[2],
        y: yPoints[1],
      },
    ];
  }

  getBounds() {
    const { _x, _y } = this;
    const halfWidth = this._base / 2;
    const halfHeight = this._height / 2;

    return {
      top: _y - halfHeight,
      right: _x + halfWidth,
      bottom: _y + halfHeight,
      left: _x - halfWidth,
    };
  }

  _createHTML() {
    if (!this._html) {
      const triangle = Element.createSVG('polygon');

      triangle.setAttribute('fill', '#ffffff');
      triangle.setAttribute('stroke', '#000000');
      triangle.setAttribute('stroke-width', '4');

      this._dom.mainElement = triangle;

      this.setSize(this._base, this._height);

      super._createHTML();
    }

    return this;
  }
}

export default Triangle;
