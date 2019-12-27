import Component from '../component/Component';
import Port from '../connection/Port';
import Connection from '../connection/Connection';

class Shape extends Component {
  static get EVENT() {
    return {
      DRAG_START: 'dragstart',
      DRAG: 'drag',
      DRAG_END: 'dragend',
    };
  }

  constructor(settings) {
    super(settings);
    this._width = null;
    this._height = null;
    this._x = null;
    this._y = null;
    this._connections = new Set();
    this._ports = [];
    this.__bulkAction = false;

    settings = jQuery.extend({
      position: {
        x: 0,
        y: 0,
      },
    }, settings);

    this._initPorts()
      .setPosition(settings.position.x, settings.position.y)
      .setSize(settings.width, settings.height);
  }

  _initPorts() {
    let index;

    for (const port_position in Port.INDEX) {
      const index = Port.INDEX[port_position];

      this._ports[index] = new Port({
        shape: this,
        orientation: index % 2,
        direction: index < 2 ? (index % 2 || -1) : (index % 2 ? -1 : 1),
      });
    }

    return this;
  }

  setX(x) {
    if (typeof x !== 'number') {
      throw new Error('setX(): invalid parameter.');
    }

    this._x = x;

    if (this._html) {
      this._html.setAttribute('transform', `translate(${x}, ${this._y})`);

      if (!this.__bulkAction) {
        this._drawConnections();
      }
    }

    return this;
  }

  getX() {
    return this._x;
  }

  setY(y) {
    if (typeof y !== 'number') {
      throw new Error('setY(): invalid parameter.');
    }
    this._y = y;

    if (this._html) {
      this._html.setAttribute('transform', `translate(${this._x}, ${y})`);

      if (!this.__bulkAction) {
        this._drawConnections();
      }
    }

    return this;
  }

  getY() {
    return this._y;
  }

  setPosition(x, y) {
    this.__bulkAction = true;

    this.setX(x)
      .setY(y);

    this.__bulkAction = false;

    return this._drawConnections();
  }

  getPosition() {
    return {
      x: this._x,
      y: this._y,
    };
  }

  setWidth(width) {
    if (typeof width !== 'number') {
      throw new Error('setWidth(): invalid parameter.');
    }
    this._width = width;
    return this;
  }

  getWidth() {
    return this._width;
  }

  setHeight(height) {
    if (typeof height !== 'number') {
      throw new Error('setHeight(): invalid parameter.');
    }
    this._height = height;
  }

  getHeight() {
    return this._height;
  }

  setSize(width, height) {
    return this.setWidth(width)
      .setHeight(height);
  }

  getSize() {
    return {
      width: this._width,
      height: this.height,
    };
  }

  getPorts() {
    return this._ports.map((port, index) => {
      const descriptor = port.getDescriptor();
      descriptor.portIndex = index;

      return descriptor;
    });
  }

  addOutgoingConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('setOutgoingConnection(): invalid parameter.');
    }

    this._connections.add(connection);

    if (connection.getOrigShape() !== this) {
      connection.setOrigShape(this);
    }

    return this;
  }

  getOutgoingConnections() {
    return new Set([...this._connections].filter((i) => i.getOrigShape() === this));
  }

  addIncomingConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('setIncomingConnection(): invalid parameter');
    }

    this._connections.add(connection);

    if (connection.getDestShape() !== this) {
      connection.setOrigShape(this);
    }

    return this;
  }

  getIncomingConnections() {
    return new Set([...this._connections].filter((i) => i.getDestShape() === this));
  }

  getConnectedShapes() {
    const prev = [];
    const next = [];

    return {
      prev: [...this.getIncomingConnections()].map((i) => i.getOrigShape()),
      next: [...this.getOutgoingConnections()].map((i) => i.getDestShape()),
    };
  }

  _removeFromPorts(connection) {
    for (const port of this._ports) {
      if (port.hasConnection(connection)) {
        port.removeConnection(connection);
      }
    }
    return this;
  }

  removeConnection(connection) {
    if (this._connections.delete(connection)) {
      this._removeFromPorts(connection);
      if (connection.isConnectedWith(this)) {
        connection.disconnect();
      }
    }
    return this;
  }

  removeConnections() {
    for (const connection of this._connections) {
      this.removeConnection(connection);
    }
    return this;
  }

  assignConnectionToPort(connection, portIndex) {
    this._removeFromPorts(connection);
    this._ports[portIndex].addConnection(connection);

    return this;
  }

  getBounds() {
    const half_width = this._width / 2;
    const half_height = this._height / 2;

    return {
      top: this._y - half_height,
      right: this._x + half_width,
      bottom: this._y + half_height,
      left: this._x - half_width,
    };
  }

  isUsingConnection(connection) {
    return this._connections.has(connection);
  }

  removeFromCanvas() {
    const oldCanvas = this._canvas;

    if (oldCanvas) {
      super.removeFromCanvas()
        .removeConnections();
    }

    return this;
  }

  _resetPorts() {
    for (const port of this._ports) {
      port.clearConnections();
    }
    return this;
  }

  _drawConnections() {
    this._resetPorts();
    for (const connection of this._connections) {
      connection.connect();
    }
    return this;
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    super._createHTML();
    this._html.setAttribute('class', 'shape');
    this._html.setAttribute('transform', `translate(${this._x}, ${this._y})`);

    return this;
  }
}

export default Shape;
