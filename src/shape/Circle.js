import Element from '../core/Element';
import Shape from './Shape';
import { DIRECTION as RESIZE_DIRECTION } from '../behavior/ResizeBehavior';

const DEFAULTS = Object.freeze({
  radius: 30,
});

class Circle extends Shape {
  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);

    this._radius = null;

    this.setRadius(settings.radius);
  }

  setRadius(radius) {
    const { mainElement } = this._dom;

    this._radius = radius;

    if (mainElement) {
      mainElement.setAttribute('r', radius);
    }

    return this;
  }

  getRadius() {
    return this._radius;
  }

  setSize(width, height) {
    this.setRadius((width + height) / 4);
  }

  adjustSize(boundingBox) {
    const { top, right, bottom, left } = boundingBox;
    const width = (right - left);
    const height = (bottom - top);
    const radius = (width + height) / 4;
    const direction = this._resizeBehavior.getCurrentDirection();
    let x;
    let y;

    switch (direction) {
      case RESIZE_DIRECTION.NW:
      case RESIZE_DIRECTION.W:
      case RESIZE_DIRECTION.SW:
        x = right - radius;
        break;
      case RESIZE_DIRECTION.NE:
      case RESIZE_DIRECTION.E:
      case RESIZE_DIRECTION.SE:
        x = left + radius;
        break;
      default:
        x = this._x;
    }

    switch (direction) {
      case RESIZE_DIRECTION.NW:
      case RESIZE_DIRECTION.N:
      case RESIZE_DIRECTION.NE:
        y = bottom - radius;
        break;
      case RESIZE_DIRECTION.SW:
      case RESIZE_DIRECTION.S:
      case RESIZE_DIRECTION.SE:
        y = top + radius;
        break;
      default:
        y = this._y;
    }

    this.setPosition(x, y);

    this.setSize(width, height);
  }

  getBounds() {
    const { _x: x, _y: y, _radius: radius } = this;

    return {
      top: y - radius,
      right: x + radius,
      bottom: y + radius,
      left: x - radius,
    };
  }

  _createHTML() {
    if (!this._html) {
      const circle = Element.createSVG('circle');

      circle.setAttribute('cx', 0);
      circle.setAttribute('cy', 0);
      circle.setAttribute('fill', '#ffffff');
      circle.setAttribute('stroke', '#000000');
      circle.setAttribute('stroke-width', '4');

      this._dom.mainElement = circle;

      this.setRadius(this._radius);

      super._createHTML();
    }

    return this;
  }
}

export default Circle;
