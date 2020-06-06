import { ORIENTATION as PORT_ORIENTATION, getPositionProps } from '../connection/Port';
import Polygon from './Polygon';

const DEFAULTS = Object.freeze({
  base: 80,
  height: 80,
});

class Triangle extends Polygon {
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
    const height = this.getHeight();

    return this.setSize(base, height);
  }

  getBase() {
    return this._base;
  }

  setHeight(height) {
    const width = this.getWidth();

    return this.setSize(width, height);
  }

  getHeight() {
    return this._height;
  }

  setWidth(width) {
    return this.setBase(width);
  }

  _mapSize(width, height) {
    this._base = width;
    this._height = height;
  }

  getPortPoint(position) {
    const { x, y } = super.getPortPoint(position);
    const { orientation, direction } = getPositionProps(position);
    const xOffset = orientation === PORT_ORIENTATION.X ? this.getWidth() / 4 : 0;

    return {
      x: x - (xOffset * direction),
      y,
    };
  }

  _getPoints() {
    const xPoints = [
      this._cWidth / -2,
      0,
      this._cWidth / 2,
    ];
    const yPoints = [
      this._cHeight / -2,
      this._cHeight / 2,
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
}

export default Triangle;
