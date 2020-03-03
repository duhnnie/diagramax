import Element from '../core/Element';
import Shape from './Shape';
import Geometry from '../utils/Geometry';

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

  setWidth(width) {
    if (typeof width !== 'number') {
      throw new Error('setWidth(): invalid parameter.');
    }

    const { mainElement } = this._dom;

    this._width = width;

    if (mainElement) {
      mainElement.setAttribute('width', width);
      mainElement.setAttribute('x', this._width * -0.5);
    }

    return this;
  }

  getWidth() {
    return this._width;
  }

  setHeight(height) {
    if (typeof height !== 'number') {
      throw new Error('setHeight(): invalid parameter.');
    }

    const { mainElement } = this._dom;
    this._height = height;

    if (mainElement) {
      mainElement.setAttribute('height', height);
      mainElement.setAttribute('y', this._height * -0.5);
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

  adjustSize(boundingBox) {
    // TODO this code is exactly the same as Rectangle.adjustSize(), fix it.
    const { x, y, width, height } = Geometry.getBoundSizeAndPos(boundingBox);

    this.setPosition(x, y);

    this.setSize(width, height);
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
