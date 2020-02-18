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
  }

  adjustSize(boundingBox) {
    const {
      top, right, bottom, left,
    } = boundingBox;
    const newWidth = right - left;
    const newHeight = bottom - top;

    this.setPosition(
      left + (newWidth / 2),
      top + (newHeight / 2),
    );

    this.setSize(
      (right - left),
      (bottom - top),
    );
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
