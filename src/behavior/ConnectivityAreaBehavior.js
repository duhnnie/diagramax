import Behavior from './Behavior';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';

class ConnectivityAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dom = {};
    this._connection = null;
    this._canvasOffset = null;
    this._shape = null;
    this._updateCanvasOffset = this._updateCanvasOffset.bind(this);
    this.end = this._bind(this.end);
  }

  end() {
    if (this._connection) {
      this._connection._reconnectionBehavior.end();
      this._connection = null;
    }
    this._shape = null;
  }

  start(shape) {
    if (!this._shape) {
      this.complete();

      const connection = this._connection || new Connection({
        canvas: this._target,
      });

      this._connection = connection;
      this._shape = shape;

      connection.start(shape);
    }
  }

  complete(shape) {
    if (this._shape && shape) {
      // TODO: connection process should be responsability of ReconnectionBehavior
      this._connection.connect(this._shape, shape);
    }

    // TODO: Should next 3 lines should be replaced by a call to end()?
    this._target.setDraggingConnection(null);
    this._shape = null;
    this._connection = null;
  }

  enterShape(shape) {
    if (this._connection) {
      this._connection._reconnectionBehavior.onShape(shape);
    }
  }

  leaveShape(shape) {
    if (this._connection) {
      this._connection._reconnectionBehavior.outShape(shape);
    }
  }

  _updateCanvasOffset() {
    this._canvasOffset = this._target.getHTML().getBoundingClientRect();
  }

  // TODO: is this deprected?
  connect(origin, destination) {
    const target = this._target;

    origin = origin instanceof Shape ? origin : target.getElementById(origin);
    destination = destination instanceof Shape ? destination : target.getElementById(destination);

    // TODO: This is hot fix, this shoudl be handled by proxied functions
    // a ticket for that was created #73
    if (origin && destination
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
    _target.getHTML().addEventListener('click', this.end, false);
    this._updateCanvasOffset();

    // TODO: Canvas should provide a way to return a position relative to it and this method should be
    // removed from this class.
    window.addEventListener('scroll', this._updateCanvasOffset, false);
  }

  detachBehavior() {
    const { _target } = this;

    _target.getHTML().removeEventListener('click', this.end, false);
    window.removeEventListener('scroll', this._updateCanvasOffset, false);

    super.detachBehavior();
  }
}

export default ConnectivityAreaBehavior;
