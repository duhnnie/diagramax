import Behavior from './Behavior';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';
import { MODE as PORT_MODE } from '../connection/Port';
// TODO: Simplify import alias in whole project, like next line:
import CommandFactory, { PRODUCTS as COMMANDS } from '../command/CommandFactory';

class ConnectivityAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this._dom = {};
    this._connection = null;
    this._canvasOffset = null;
    this._shape = null;
    this._updateCanvasOffset = this._updateCanvasOffset.bind(this);
    this.start = this._bind(this.start);
    this.complete = this._bind(this.complete);
    this.enterShape = this._bind(this.enterShape);
    this.leaveShape = this._bind(this.leaveShape);
    this.end = this._bind(this.end);
  }

  end() {
    if (this._connection) {
      this._connection.end();
    }
    this._shape = null;
    this._connection = null;
    this._direction = null;
  }

  start(shape, connection = null, direction = PORT_MODE.DEST) {
    if (!this._shape) {
      this.complete();

      connection = connection || new Connection({
        canvas: this._target,
      });

      this._connection = connection;
      this._shape = shape;
      this._direction = direction;

      connection.select();
      connection.start(shape, direction);
    }
  }

  complete(shape) {
    if (this._shape && shape) {
      let orig;
      let dest;

      if (this._direction === PORT_MODE.ORIG) {
        orig = shape;
        dest = this._shape;
      } else {
        orig = this._shape;
        dest = shape;
      }

      const command = CommandFactory.create(COMMANDS.CONNECT, this._target, orig, dest, this._connection);

      // TODO: Fix access to protected method.
      this._target._executeCommand(command);
    }

    this.end();
  }

  enterShape(shape) {
    if (this._connection) {
      this._connection._dragBehavior.onShape(shape);
    }
  }

  leaveShape(shape) {
    if (this._connection) {
      this._connection._dragBehavior.outShape(shape);
    }
  }

  getCurrentProcess() {
    if (this._connection) {
      // TODO: Fix several access to private members in next line.
      const origShape = this._connection._dragBehavior._origShape;
      const destShape = this._connection._dragBehavior._destShape;

      return [origShape || destShape, this._connection, origShape ? PORT_MODE.DEST : PORT_MODE.ORIG];
    }

    return null;
  }

  _updateCanvasOffset() {
    this._canvasOffset = this._target.getHTML().getBoundingClientRect();
  }

  // TODO: maybe this should be replaced by the call canvas' startConnection() and completeConnection() or think to
  // move it back to Canvas;
  connect(origin, destination) {
    this._target.connect(origin, destination);
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
