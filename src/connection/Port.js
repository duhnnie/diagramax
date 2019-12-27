import BPMNShape from '../shape/Shape';
import Connection from './Connection';

class Port {
  static get ORIENTATION() {
    return {
      VERTICAL: 0,
      HORIZONTAL: 1,
    };
  }

  static get DIRECTION() {
    return {
      BACKWARD: -1,
      FORWARD: 1,
    };
  }

  static get MODE() {
    return {
      IN: 0,
      OUT: 1,
    };
  }

  static get INDEX() {
    return {
      NORTH: 0,
      EAST: 1,
      SOUTH: 2,
      WEST: 3,
    };
  }

  static get PRIORITY() {
    return {
      [Port.ORIENTATION.VERTICAL]: {
        '-1': [Port.INDEX.NORTH, Port.INDEX.SOUTH],
        0: [Port.INDEX.SOUTH, Port.INDEX.NORTH],
        1: [Port.INDEX.SOUTH, Port.INDEX.NORTH],
      },
      [Port.ORIENTATION.HORIZONTAL]: {
        '-1': [Port.INDEX.WEST, Port.INDEX.EAST],
        0: [Port.INDEX.EAST, Port.INDEX.WEST],
        1: [Port.INDEX.EAST, Port.INDEX.WEST],
      },
    };
  }

  constructor(settings) {
    this._mode = null;
    this._orientation = null;
    this._direction = null;
    this._connections = new Set();
    this._shape = null;

    settings = jQuery.extend({
      connections: [],
      shape: null,
    }, settings);

    this._setShape(settings.shape)
      ._setOrientation(settings.orientation)
      ._setDirection(settings.direction)
      .setConnections(settings.connections);
  }

  get mode() {
    return this._mode;
  }

  get orientation() {
    return this._orientation;
  }

  get direction() {
    return this._direction;
  }

  get size() {
    return this._connections.size;
  }

  _setShape(shape) {
    if (!(shape instanceof BPMNShape)) {
      throw new Error('setShape(): invalid parameter.');
    }

    this._shape = shape;
    return this;
  }

  _setOrientation(orientation) {
    if (!Object.keys(Port.ORIENTATION).find((i) => Port.ORIENTATION[i] === orientation)) {
      throw new Error('setOrientation(): invalid parameter.');
    }

    this._orientation = orientation;
    return this;
  }

  _setDirection(direction) {
    if (!Object.keys(Port.DIRECTION).find((i) => Port.DIRECTION[i] === direction)) {
      throw new Error('setDirection(): invalid parameter.');
    }

    this._direction = direction;
    return this;
  }

  addConnection(connection) {
    let newMode;

    if (!connection instanceof Connection) {
      throw new Error('addConnection(): Invalid parameter.');
    } else if (!this._shape.isUsingConnection(connection)) {
      throw new Error('addConnection(): the supplied connection doesn\'t belong to this shape.');
    }

    newMode = connection.getOrigShape() === this._shape ? Port.MODE.OUT : Port.MODE.IN;

    if (newMode !== this._mode && this._mode !== null) {
      throw new Error('addConnection(): Invalid connection direction.');
    }

    this._mode = newMode;
    this._connections.add(connection);
    return this;
  }

  setConnections(connections) {
    for (const connection in connections) {
      this.addConnection(connection);
    }
    return this;
  }

  hasConnection(connection) {
    return this._connections.has(connection);
  }

  removeConnection(connection) {
    if (this._connections.delete(connection)) {
      this._mode = this._connections.size ? this._mode : null;
    }
    return this;
  }

  clearConnections() {
    this._connections.clear();
    this._mode = null;
    return this;
  }

  getDescriptor() {
    return {
      orientation: this._orientation,
      direction: this._direction,
      mode: this._mode,
      point: this.getConnectionPoint(),
    };
  }

  getConnectionPoint() {
    const shapePosition = this._shape.getPosition();
    const orientation = this._orientation;
    const direction = this._direction;
    const xOffset = orientation ? this._shape.getWidth() / 2 : 0;
    const yOffset = !orientation ? this._shape.getHeight() / 2 : 0;

    return {
      x: shapePosition.x + (xOffset * direction),
      y: shapePosition.y + (yOffset * direction),
    };
  }
}

export default Port;
