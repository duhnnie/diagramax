import Element from '../core/Element';
import Shape from './Shape';

const DEFAULTS = Object.freeze({
  width: 80,
  height: 80,
});

class Triangle extends Shape {
  static toPointsString(points) {
    return points.map(({ x, y }) => `${x},${y}`).join(' ');
  }

  constructor(settings) {
    settings = {
      ...DEFAULTS,
      ...settings,
    };

    super(settings);
  }

  /**
   * @alias Shape.setWidth
   */
  setBase(base) {
    return this.setWidth(base);
  }

  /**
   * @alias Shape.getWidth
   */
  getBase() {
    return this.getWidth();
  }

  _getPoints() {
    const xPoints = [
      this._width * -0.5,
      0,
      this._width * 0.5,
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

  _createHTML() {
    if (!this._html) {
      const triangle = Element.createSVG('polygon');

      triangle.setAttribute('points', Triangle.toPointsString(this._getPoints()));
      triangle.setAttribute('fill', '#ffffff');
      triangle.setAttribute('stroke', '#000000');
      triangle.setAttribute('stroke-width', '4');

      this._dom.mainElement = triangle;

      super._createHTML();
    }

    return this;
  }
}

export default Triangle;
