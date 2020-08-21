import BaseElement from '../core/BaseElement';
import Shape from './Shape';

const DEFAULTS = {
  width: 80,
  height: 80,
};

class Rectangle extends Shape {
  static get type() {
    return 'rectangle';
  }

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

  _updateSize(width, height) {
    const { rect } = this._dom;

    super._updateSize(width, height);

    if (rect) {
      rect.setAttribute('width', width);
      rect.setAttribute('x', width * -0.5);
      rect.setAttribute('height', height);
      rect.setAttribute('y', height * -0.5);
    }
  }

  setWidth(width) {
    const height = this.getHeight();

    return this.setSize(width, height);
  }

  getWidth() {
    return this._width;
  }

  setHeight(height) {
    const width = this.getWidth();

    return this.setSize(width, height);
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

  _mapSize(width, height) {
    this._width = width;
    this._height = height;
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

  _createElement() {
    if (!this._el) {
      const rect = BaseElement.createSVG('rect');

      super._createElement();

      this._dom.rect = rect;
      this._getMainElement().append(rect);
      this.setSize(this._width, this._height);
    }

    return this;
  }
}
export default Rectangle;
