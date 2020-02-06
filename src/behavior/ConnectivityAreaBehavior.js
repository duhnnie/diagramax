import Behavior from './Behavior';
import Element from '../core/Element';

class ConnectivityAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._origin = null;
    this._destiny = null;
    this._dom = {};
    this._canvasOffset = null;
    this._onMouseMove = this._onMouseMove.bind(this);
    this._updateCanvasOffset = this._updateCanvasOffset.bind(this);
  }

  _getDestPoint(x, y) {
    return {
      x: x - this._canvasOffset.left - 1,
      y: y - this._canvasOffset.top - 1,
    };
  }

  _onMouseMove(event) {
    if (this._origin) {
      const { x, y } = this._getDestPoint(event.clientX, event.clientY);

      this._dom.line.setAttribute('x2', x);
      this._dom.line.setAttribute('y2', y);
    }
  }

  _setConnectionLinePath({ x: x1, y: y1 }, { x: x2, y: y2 }) {
    this._dom.line.setAttribute('x1', x1);
    this._dom.line.setAttribute('y1', y1);
    this._dom.line.setAttribute('x2', x2);
    this._dom.line.setAttribute('y2', y2);
  }

  _connect() {
    this._target.connect(this._origin, this._destiny);
    this._origin = null;
    this._destiny = null;
    this._dom.line.setAttribute('stroke', '');
  }

  connectionClick(shape, point) {
    if (this._origin) {
      this._destiny = shape;
      this._connect();
    } else {
      this._origin = shape;
      this._setConnectionLinePath(shape.getPosition(), this._getDestPoint(point.x, point.y));
      this._dom.line.setAttribute('stroke', 'black');
      this._target.getContainer().appendChild(this._dom.line);
    }
  }

  _updateCanvasOffset() {
    this._canvasOffset = this._target.getHTML().getBoundingClientRect();
  }

  attachBehavior() {
    // This method should be called after the Canvas' HTML has been created and set to
    // its _html property.
    // TODO: make sure to call this method only once
    this._dom.line = Element.createSVG('line');
    this._target.getHTML().addEventListener('mousemove', this._onMouseMove, false);
    this._updateCanvasOffset();

    window.addEventListener('scroll', this._updateCanvasOffset, false);
  }
}

export default ConnectivityAreaBehavior;