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
  NEGATIVE: -1,
  POSITIVE: 1,
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

function getPositionProps(position) {
  return POSITION.props[position];
}

class Port {
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
      throw new Error('setShape(): invalid parameter.');
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
    const { orientation, direction } = getPositionProps(this._position);

    return {
      orientation,
      direction,
      mode: this._mode,
      point: this.getConnectionPoint(),
    };
  }

  getConnectionPoint() {
    const { orientation, direction } = getPositionProps(this._position);
    const shapePosition = this._shape.getPosition();
    const xOffset = orientation === ORIENTATION.X ? this._shape.getWidth() / 2 : 0;
    const yOffset = orientation === ORIENTATION.Y ? this._shape.getHeight() / 2 : 0;

    return {
      x: shapePosition.x + (xOffset * direction),
      y: shapePosition.y + (yOffset * direction),
    };
  }
}

export default Port;
