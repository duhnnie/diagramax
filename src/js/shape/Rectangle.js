import Element from '../core/Element';
import Shape from './Shape';

const DEFAULTS = {
  width: 80,
  height: 80,
};

class Rectangle extends Shape {
  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);
    this._width = null;
    this._height = null;

    this.setSize(settings.width, settings.height);
  }

  _updateSize() {
    const { mainElement } = this._dom;
    const { _width, _height } = this;

    if (mainElement) {
      mainElement.setAttribute('width', _width);
      mainElement.setAttribute('x', _width * -0.5);
      mainElement.setAttribute('height', _height);
      mainElement.setAttribute('y', _height * -0.5);
    }
  }

  setWidth(width, keepProportion = false) {
    if (typeof width !== 'number') {
      throw new Error('setWidth(): invalid parameter.');
    }

    const size = this.getSize();

    if (keepProportion) {
      const height = width / this.getRatio();

      return this.setSize(width, height);
    }

    this._width = width;

    if (!this.__bulkAction) {
      this._updateSize();
      this._sizeHasChanged(size);
    }

    return this;
  }

  getWidth() {
    return this._width;
  }

  setHeight(height, keepProportion = false) {
    if (typeof height !== 'number') {
      throw new Error('setHeight(): invalid parameter.');
    }

    const size = this.getSize();

    if (keepProportion) {
      const width = this.getRatio() * height;

      return this.setSize(width, height);
    }

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

  getSize() {
    return {
      width: this._width,
      height: this._height,
    };
  }

  getBounds() {
    const { _x: x, _y: y } = this;
    const halfWidth = this._width / 2;
    const halfHeight = this._height / 2;

    return {
      top: y - halfHeight,
      right: x + halfWidth,
      bottom: y + halfHeight,
      left: x - halfWidth,
    };
  }

  _createHTML() {
    if (!this._html) {
      const rect = Element.createSVG('rect');

      this._dom.mainElement = rect;

      rect.setAttribute('fill', '#ffffff');
      rect.setAttribute('stroke', '#000000');
      this.setSize(this._width, this._height);
      rect.setAttribute('stroke-width', 4);
      rect.setAttribute('stroke-dasharray', 0);

      super._createHTML();
    }

    return this;
  }
}
export default Rectangle;
