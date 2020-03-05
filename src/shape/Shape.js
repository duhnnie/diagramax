import Component from '../component/Component';
import Port from '../connection/Port';
import Connection from '../connection/Connection';
import RegularDraggableShapeBehavior from '../behavior/RegularDraggableShapeBehavior';
import ConnectivityBehavior from '../behavior/ConnectivityBehavior';
import SelectBehavior from '../behavior/SelectBehavior';
import ResizeBehavior, { EVENT as RESIZE_EVENT, DIRECTION } from '../behavior/ResizeBehavior';
import ShapeControlsLayer from './components/ShapeControlsLayer';
import Geometry from '../utils/Geometry';

const DEFAULTS = {
  position: {
    x: 0,
    y: 0,
  },
};

class Shape extends Component {
  constructor(settings) {
    super(settings);
    this._x = null;
    this._y = null;
    this._connections = new Set();
    this._ports = [];
    this._controlsLayer = new ShapeControlsLayer();
    this._dragBehavior = new RegularDraggableShapeBehavior(this);
    this._connectivityBehavior = new ConnectivityBehavior(this);
    this._selectBehavior = new SelectBehavior(this);
    this._resizeBehavior = new ResizeBehavior(this);
    this.__bulkAction = false;

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this._initPorts()
      .setPosition(settings.position.x, settings.position.y);
  }

  _initPorts() {
    Object.values(Port.INDEX).forEach((portIndex) => {
      let direction = portIndex % 2 ? -1 : 1;

      if (portIndex < 2) {
        direction = portIndex % 2 || -1;
      }

      this._ports[portIndex] = new Port({
        shape: this,
        orientation: portIndex % 2 ? Port.ORIENTATION.X : Port.ORIENTATION.Y,
        direction,
      });
    });

    return this;
  }

  _sizeHasChanged(oldSize) {
    const { oldWidth, oldHeight } = oldSize;
    const size = this.getSize();
    const { width, height } = size;
    const canvas = this.getCanvas();

    if (canvas && (width !== oldWidth || height !== oldHeight)) {
      this.getCanvas().dispatchEvent(RESIZE_EVENT.RESIZE, this, {
        previous: oldSize,
        current: size,
      });
    }
  }

  setX(x) {
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

  // eslint-disable-next-line class-methods-use-this
  _updateSize() {
    throw new Error('updateSize(): This method should be implemented.');
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  setWidth(width, keepProportion) {
    throw new Error('setWidth(): This method should be implemented.');
  }

  getWidth() {
    return this.getSize().width;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  setHeight(height, keepProportion) {
    throw new Error('setHeight(): This method should be implemented.');
  }

  getHeight() {
    return this.getSize().height;
  }

  getRatio() {
    return this.getWidth() / this.getHeight();
  }

  setSize(width, height) {
    const size = this.getSize();

    this.__bulkAction = true;

    this.setWidth(width)
      .setHeight(height);

    this._updateSize();
    this._sizeHasChanged(size);

    this.__bulkAction = false;

    return this._drawConnections();
  }

  // eslint-disable-next-line class-methods-use-this
  getBounds() {
    throw new Error('getBounds(): This method should be implemented.');
  }

  getSize() {
    const {
      top,
      right,
      bottom,
      left,
    } = this.getBounds();
    const width = right - left;
    const height = bottom - top;

    return { width, height };
  }

  getPortDescriptor(index) {
    const port = this._ports[index];

    if (port) {
      const descriptor = port.getDescriptor();

      descriptor.portIndex = index;

      return descriptor;
    }

    return null;
  }

  getPorts() {
    return this._ports.map((port, index) => this.getPortDescriptor(index));
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
    return {
      prev: [...this.getIncomingConnections()].map((i) => i.getOrigShape()),
      next: [...this.getOutgoingConnections()].map((i) => i.getDestShape()),
    };
  }

  _removeFromPorts(connection) {
    this._ports.forEach((port) => {
      if (port.hasConnection(connection)) {
        port.removeConnection(connection);
      }
    });
    return this;
  }

  removeConnection(connection) {
    if (this._connections.has(connection)) {
      this._removeFromPorts(connection);
      if (connection.isConnectedWith(this)) {
        connection.disconnect();
      }
      this._connections.delete(connection);
    }
    return this;
  }

  removeConnections() {
    this._connections.forEach((connection) => {
      this.removeConnection(connection);
    });

    return this;
  }

  assignConnectionToPort(connection, portIndex) {
    this._removeFromPorts(connection);
    this._ports[portIndex].addConnection(connection);

    return this;
  }

  isUsingConnection(connection) {
    return this._connections.has(connection);
  }

  isBeingDragged() {
    return this._dragBehavior.isDragging();
  }

  isBeingResized() {
    return this._resizeBehavior.isDragging();
  }

  removeFromCanvas() {
    const oldCanvas = this._canvas;

    if (oldCanvas) {
      super.removeFromCanvas()
        .removeConnections();
    }

    return this;
  }

  hasAvailablePortFor(portIndex, mode) {
    const selectedPort = this._ports[portIndex];

    if (selectedPort) {
      if (selectedPort.mode === null) {
        const portsInMode = this._ports.filter((port) => port.mode === mode);

        return portsInMode.length < 3;
      }

      // TODO: the validationcan be performed here and isAvailableFor() could be removed, unless it
      // is used somewhere else.
      return selectedPort.isAvailableFor(mode);
    }

    return false;
  }

  /**
   * If the shape is selected.
   * @returns {Boolean}
   */
  isSelected() {
    return this._selectBehavior.isSelected();
  }

  /**
   * Selects the shape.
   */
  select() {
    this._selectBehavior.start();
  }

  /**
   * Unselects the shape.
   */
  unselect() {
    this._selectBehavior.unselect();
  }

  /**
   * Aligns the Shape inside the specified boundary.
   * @param {Object} boundary A boundary object inside the Shape will be aligned to.
   * @param {ResizeBehavior.DIRECTION} alignment The direction to align the Shape to.
   */
  align(boundary, alignment = null) {
    const { width, height } = this.getSize();
    let { x, y } = Geometry.getBoundSizeAndPos(boundary);

    switch (alignment) {
      case DIRECTION.W:
      case DIRECTION.NW:
      case DIRECTION.SW:
        x = boundary.left + (width / 2);
        break;
      case DIRECTION.E:
      case DIRECTION.NE:
      case DIRECTION.SE:
        x = boundary.right - (width / 2);
      default:
    }

    switch (alignment) {
      case DIRECTION.N:
      case DIRECTION.NW:
      case DIRECTION.NE:
        y = boundary.top + (height / 2);
        break;
      case DIRECTION.S:
      case DIRECTION.SW:
      case DIRECTION.SE:
        y = boundary.bottom - (height / 2);
        break;
      default:
    }

    this.setPosition(x, y);
  }

  /**
   * Add a graphic control for manipulating the Shape.
   * @param {SVGElement} svgElement An SVG element to be the graphic control for the Shape.
   * @param {Object} events An object in which the key is an event name and its value is a function
   * or an array
   * in which each element is a function to be executed when that event occurs.
   */
  _addControl(svgElement, events) {
    this._controlsLayer.addControl(svgElement, events);
  }

  _resetPorts() {
    this._ports.forEach((port) => {
      port.clearConnections();
    });

    return this;
  }

  _drawConnections() {
    this._resetPorts();

    this._connections.forEach((connection) => {
      connection.connect();
    });

    return this;
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    super._createHTML();

    this._html.setAttribute('class', 'shape');
    this._html.setAttribute('transform', `translate(${this._x}, ${this._y})`);

    this._html.insertBefore(this._dom.mainElement, this._dom.title);
    this._html.prepend(this._controlsLayer.getHTML());

    this._connectivityBehavior.attachBehavior();
    this._dragBehavior.attachBehavior();
    this._selectBehavior.attachBehavior();
    this._resizeBehavior.attachBehavior();

    return this;
  }
}

export default Shape;
