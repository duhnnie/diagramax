import BaseElement from '../core/BaseElement';
import Shape from './Shape';

// TODO: doc this as abstract
class Polygon extends Shape {
  static get type() {
    return 'polygon';
  }

  static toPointsString(points) {
    return points.map(({ x, y }) => `${x},${y}`).join(' ');
  }

  // eslint-disable-next-line class-methods-use-this
  _getPoints() {
    throw new Error('_getPoints(): This method should be implemented.');
  }

  _updateSize(width, height) {
    const { polygon } = this._dom;

    super._updateSize(width, height);

    if (polygon) {
      polygon.setAttribute('points', Polygon.toPointsString(this._getPoints()));
    }

    return this;
  }

  _createHTML() {
    if (!this._html) {
      const polygon = BaseElement.createSVG('polygon');

      super._createHTML();

      this._dom.polygon = polygon;
      this._getMainElement().append(polygon);
      this.setSize(this._base, this._height);
    }

    return this;
  }
}

export default Polygon;
