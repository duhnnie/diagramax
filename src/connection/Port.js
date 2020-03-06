import BPMNShape from '../shape/Shape';
import Connection from './Connection';

const DEFAULTS = {
  connections: [],
  shape: null,
};

export const ORIENTATION = Object.freeze({
  X: 'x',
  Y: 'y',
});

export const DIRECTION = Object.freeze({
  BACKWARD: -1,
  FORWARD: 1,
});

export const MODE = Object.freeze({
  IN: 0,
  OUT: 1,
});

export const POSITION = Object.freeze({
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
});

export const PRIORITY = Object.freeze({
  [ORIENTATION.Y]: {
    '-1': [POSITION.NORTH, POSITION.SOUTH],
    0: [POSITION.SOUTH, POSITION.NORTH],
    1: [POSITION.SOUTH, POSITION.NORTH],
  },
  [ORIENTATION.X]: {
    '-1': [POSITION.WEST, POSITION.EAST],
    0: [POSITION.EAST, POSITION.WEST],
    1: [POSITION.EAST, POSITION.WEST],
  },
});

class Port {
  constructor(settings) {
    this._mode = null;
    this._orientation = null;
    this._direction = null;
    this._connections = new Set();
    this._shape = null;

    settings = { ...DEFAULTS, ...settings };

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
    if (!Object.keys(ORIENTATION).find((i) => ORIENTATION[i] === orientation)) {
      throw new Error('setOrientation(): invalid parameter.');
    }

    this._orientation = orientation;
    return this;
  }

  _setDirection(direction) {
    if (!Object.keys(DIRECTION).find((i) => DIRECTION[i] === direction)) {
      throw new Error('setDirection(): invalid parameter.');
    }

    this._direction = direction;
    return this;
  }

  isAvailableFor(mode) {
    return this._mode === null || this._mode === mode;
  }

  addConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('addConnection(): Invalid parameter.');
    } else if (!this._shape.isUsingConnection(connection)) {
      throw new Error('addConnection(): the supplied connection doesn\'t belong to this shape.');
    }

    const newMode = connection.getOrigShape() === this._shape ? MODE.OUT : MODE.IN;

    if (newMode !== this._mode && this._mode !== null) {
      throw new Error('addConnection(): Invalid connection direction.');
    }

    this._mode = newMode;
    this._connections.add(connection);
    return this;
  }

  setConnections(connections) {
    connections.forEach((connection) => {
      this.addConnection(connection);
    });

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
    const xOffset = orientation === ORIENTATION.X ? this._shape.getWidth() / 2 : 0;
    const yOffset = orientation === ORIENTATION.Y ? this._shape.getHeight() / 2 : 0;

    return {
      x: shapePosition.x + (xOffset * direction),
      y: shapePosition.y + (yOffset * direction),
    };
  }
}

export default Port;
