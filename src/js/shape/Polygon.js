import Element from '../core/Element';
import Shape from './Shape';

// TODO: doc this as abstract
class Polygon extends Shape {
  static toPointsString(points) {
    return points.map(({ x, y }) => `${x},${y}`).join(' ');
  }

  // eslint-disable-next-line class-methods-use-this
  _getPoints() {
    throw new Error('_getPoints(): This method should be implemented.');
  }

  _updateSize() {
    const { mainElement } = this._dom;

    if (mainElement) {
      mainElement.setAttribute('points', Polygon.toPointsString(this._getPoints()));
    }

    return this;
  }

  _createHTML() {
    if (!this._html) {
      const polygon = Element.createSVG('polygon');

      polygon.setAttribute('fill', '#ffffff');
      polygon.setAttribute('stroke', '#000000');
      polygon.setAttribute('stroke-width', '4');

      this._dom.mainElement = polygon;
      super._createHTML();
      this.setSize(this._base, this._height);
    }

    return this;
  }
}

export default Polygon;
