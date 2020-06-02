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

  setBase(base, keepProportion) {
    if (keepProportion) {
      const height = base / this.getRatio();

      return this.setSize(base, height);
    }

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

  setHeight(height, keepProportion = false) {
    if (keepProportion) {
      const width = this.getRatio() * height;

      return this.setSize(width, height);
    }

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

  setWidth(width, keepProportion = false) {
    return this.setBase(width, keepProportion);
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
}

export default Triangle;
