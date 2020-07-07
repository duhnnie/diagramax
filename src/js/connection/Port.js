import BPMNShape from '../shape/Shape';
import Connection from './Connection';
import ErrorThrower from '../utils/ErrorThrower';

const DEFAULTS = {
  connections: [],
  shape: null,
};

export const ORIENTATION = Object.freeze({
  X: 'x',
  Y: 'y',
});

// TOOD: this could be renamed to WAY and POSITION could be DIRECTION
export const DIRECTION = Object.freeze({
  NEGATIVE: -1,
  POSITIVE: 1,
});

// TODO: It is not the same as Connection.POINT?
export const MODE = Object.freeze({
  ORIG: 0,
  DEST: 1,
});

export const POSITION = Object.freeze({
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3,
  props: {
    0: {
      orientation: ORIENTATION.Y,
      direction: DIRECTION.NEGATIVE,
    },
    1: {
      orientation: ORIENTATION.X,
      direction: DIRECTION.POSITIVE,
    },
    2: {
      orientation: ORIENTATION.Y,
      direction: DIRECTION.POSITIVE,
    },
    3: {
      orientation: ORIENTATION.X,
      direction: DIRECTION.NEGATIVE,
    },
  },
});

export function getPositionProps(position) {
  return POSITION.props[position];
}

class Port {
  static getPriority(orientation, direction) {
    let priorityOrder;

    switch (orientation) {
      case ORIENTATION.Y:
        if (direction === DIRECTION.NEGATIVE) {
          priorityOrder = [POSITION.NORTH, POSITION.SOUTH];
        } else {
          priorityOrder = [POSITION.SOUTH, POSITION.NORTH];
        }

        break;
      case ORIENTATION.X:
      default:
        if (direction === DIRECTION.NEGATIVE) {
          priorityOrder = [POSITION.WEST, POSITION.EAST];
        } else {
          priorityOrder = [POSITION.EAST, POSITION.WEST];
        }
    }

    return priorityOrder;
  }

  constructor(settings) {
    this._mode = null;
    this._position = null;
    this._connections = new Set();
    this._shape = null;

    settings = { ...DEFAULTS, ...settings };

    this._setShape(settings.shape)
      ._setPosition(settings.position)
      .setConnections(settings.connections);
  }

  get mode() {
    return this._mode;
  }

  get orientation() {
    return getPositionProps(this._position).orientation;
  }

  get direction() {
    return getPositionProps(this._position).direction;
  }

  get size() {
    return this._connections.size;
  }

  _setShape(shape) {
    if (!(shape instanceof BPMNShape)) {
      ErrorThrower.invalidParameter();
    }

    this._shape = shape;
    return this;
  }

  _setPosition(position) {
    this._position = position;
    return this;
  }

  isAvailableFor(mode) {
    return this._mode === null || this._mode === mode;
  }

  addConnection(connection, mode) {
    if (!(connection instanceof Connection)) {
      ErrorThrower.invalidParameter();
    } else if (!this._shape.isUsingConnection(connection)) {
      ErrorThrower.custom('The supplied connection doesn\'t belong to this shape.');
    } else if ((mode === MODE.DEST && connection.getDestShape() !== this._shape)
     || (mode === MODE.ORIG && connection.getOrigShape() !== this._shape)) {
      ErrorThrower.custom('Mode doesn\'t match with connection direction.');
    }

    if (mode !== this._mode && this._mode !== null) {
      ErrorThrower.custom('Invalid connection direction.');
    }

    this._mode = mode;
    this._connections.add(connection);
    return this;
  }

  setConnections(connections) {
    connections.forEach((connection, mode) => {
      this.addConnection(connection, mode);
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

  getDescription() {
    const index = this._position;

    return {
      orientation: this.orientation,
      direction: this.direction,
      mode: this.mode,
      point: this._shape.getPortPoint(index),
      portIndex: index,
    };
  }
}

export default Port;
