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

  _updateSize(width, height) {
    const { mainElement } = this._dom;

    super._updateSize(width, height);

    if (mainElement) {
      mainElement.setAttribute('width', width);
      mainElement.setAttribute('x', width * -0.5);
      mainElement.setAttribute('height', height);
      mainElement.setAttribute('y', height * -0.5);
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
