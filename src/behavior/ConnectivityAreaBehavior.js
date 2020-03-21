import Behavior from './Behavior';
import Element from '../core/Element';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';

class ConnectivityAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._origin = null;
    this._destiny = null;
    this._dom = {};
    this._canvasOffset = null;
    this._onClick = this._onClick.bind(this);
    this.addShape = this._bind(this.addShape);
    this._onMouseMove = this._bind(this._onMouseMove);
    this.connect = this._bind(this.connect);
    this._updateCanvasOffset = this._updateCanvasOffset.bind(this);
  }

  _getDestPoint(x, y) {
    return {
      x: x - this._canvasOffset.left - 1,
      y: y - this._canvasOffset.top - 1,
    };
  }

  _onClick() {
    this.end();
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

  end() {
    this._origin = null;
    this._destiny = null;
    this._dom.line.setAttribute('stroke', '');
  }

  _setOrigin(shape, point) {
    this._origin = shape;
    this._setConnectionLinePath(shape.getPosition(), this._getDestPoint(point.x, point.y));
    this._dom.line.setAttribute('stroke', 'black');
    if (!this._dom.line.isConnected) this._target.getContainer().appendChild(this._dom.line);
  }

  /**
   * Adds a shape to the connection process. If there isn't any shapes set yet it will be set as
   * origin, otherwise the shape will be taken as destiny and the connection will be applied
   * (if it's valid).
   * @param {Shape} shape An instance of Shape
   * @param {Point} point The point in which
   */
  addShape(shape, point, chain) {
    if (this._origin) {
      this._destiny = shape;
      this.connect(this._origin, shape);

      if (chain) {
        this._setOrigin(this._destiny, point);
        this._destiny = null;
      } else {
        this.end();
      }
    } else {
      this._setOrigin(shape, point);
    }
  }

  _updateCanvasOffset() {
    this._canvasOffset = this._target.getHTML().getBoundingClientRect();
  }

  connect(origin, destination) {
    const target = this._target;

    origin = origin instanceof Shape ? origin : target.getElementById(origin);
    destination = destination instanceof Shape ? destination : target.getElementById(destination);

    // TODO: This is hot fix, this shoudl be handled by proxied functions
    // a ticket for that was created #73
    if (origin && destination && origin !== destination
      && !origin._connectivityBehavior._disabled && !destination._connectivityBehavior._disabled) {
      const connection = new Connection({
        canvas: target,
        origShape: origin,
        destShape: destination,
      });
    }

    return this;
  }

  attachBehavior() {
    const { _target } = this;
    // This method should be called after the Canvas' HTML has been created and set to
    // its _html property.
    // TODO: make sure to call this method only once
    this._dom.line = Element.createSVG('line');
    _target.getHTML().addEventListener('click', this._onClick, false);
    _target.getHTML().addEventListener('mousemove', this._onMouseMove, false);
    this._updateCanvasOffset();

    // TODO: Canvas should provide a way to return a position relative to it and this method should be
    // removed from this class.
    window.addEventListener('scroll', this._updateCanvasOffset, false);
  }

  detachBehavior() {
    const { _target } = this;

    _target.getHTML().removeEventListener('click', this._onClick, false);
    _target.getHTML().removeEventListener('mousemove', this._onMouseMove, false);
    window.removeEventListener('scroll', this._updateCanvasOffset, false);

    super.detachBehavior();
  }
}

export default ConnectivityAreaBehavior;
