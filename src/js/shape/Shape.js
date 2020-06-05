import Component from '../component/Component';
import Port, { getPositionProps, MODE as PORT_MODE, ORIENTATION as PORT_ORIENTATION, POSITION as PORT_POSITION, ORIENTATION } from '../connection/Port';
import Connection from '../connection/Connection';
import EditableTextBehavior from '../behavior/EditableTextBehavior';
import RegularDraggableShapeBehavior from '../behavior/RegularDraggableShapeBehavior';
import ConnectivityBehavior from '../behavior/ConnectivityBehavior';
import ResizeBehavior, { EVENT as RESIZE_EVENT, DIRECTION } from '../behavior/ResizeBehavior';
import Geometry from '../utils/Geometry';
import ShapeUI from './ShapeUI';

/*
 * Returns and array with the port indexes sorted in priority order for elegibility based on a
 * primary orientation.
 * @param {Number} mainOrientation The orientation index that will be the assumed as the
 * prioritized one.
 * @param {Object} Object containing the relative position, x and y respect to destination in
 * respective axis.
 * @returns {Array}
 */
function getPortPriorityOrder(mainOrientation, { x, y }) {
  const crossOrientation = mainOrientation === PORT_ORIENTATION.X
    ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X;
  const mainPorts = Port.getPriority(mainOrientation, mainOrientation === PORT_ORIENTATION.X
    ? x : y);
  const crossPorts = Port.getPriority(crossOrientation, crossOrientation === PORT_ORIENTATION.X
    ? x : y);

  mainPorts.splice(1, 0, ...crossPorts);

  return mainPorts;
}

const DEFAULTS = {
  position: {
    x: 0,
    y: 0,
  },
};

export const EVENT = Object.freeze({
  POSITION_CHANGE: 'position:change',
  DRAG_START: 'drag:start',
  DRAG: 'drag',
  DRAG_END: 'drag:end',
});

class Shape extends Component {
  constructor(settings) {
    super(settings);
    this._x = null;
    this._y = null;
    this._cx = null;
    this._cy = null;
    this._connections = new Set();
    this._ports = [];
    // TODO: component's text is defined in Component, so this behavior should be defined in that class.
    this._editableBehavior = new EditableTextBehavior(this);
    this._dragBehavior = new RegularDraggableShapeBehavior(this);
    this._connectivityBehavior = new ConnectivityBehavior(this);
    this._resizeBehavior = new ResizeBehavior(this);
    this.__bulkAction = false;

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this._initPorts()
      .setPosition(settings.position.x, settings.position.y);
  }

  _getComponentUI() {
    return new ShapeUI(this);
  }

  _initPorts() {
    Object.values(PORT_POSITION).forEach((position) => {
      if (typeof position !== 'number') return;

      this._ports[position] = new Port({
        shape: this,
        position,
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
      canvas.dispatchEvent(RESIZE_EVENT.RESIZE, this, {
        previous: oldSize,
        current: size,
      });
    }
  }

  _triggerPositionChange(x, y) {
    const canvas = this.getCanvas();

    if (canvas) canvas.dispatchEvent(EVENT.POSITION_CHANGE, this, this.getPosition(), { x, y });
  }

  _updatePosition(x, y) {
    this._cx = x;
    this._cy = y;

    if (this._html) {
      this._html.setAttribute('transform', `translate(${x}, ${y})`);
      // TODO: Connections should be drawn from Connection itself at listening Shape's drag and position change event.
      this._drawConnections();
    }
  }

  setX(x) {
    this.setPosition(x, this._y);
  }

  getX() {
    return this._x;
  }

  setY(y) {
    this.setPosition(this._x, y);
  }

  getY() {
    return this._y;
  }

  getCurrentPosition() {
    return { x: this._cx, y: this._cy };
  }

  /**
   * Set's the shape's position.
   * @param {Number} x The x coordinate.
   * @param {Number} y The y coordinate.
   *//**
   * Set's the shape's position.
   * @param {Point} point An object containing Number values in its x and y properties.
   */
  setPosition(...args) {
    const oldX = this._x;
    const oldY = this._y;
    let [x, y] = args;

    if (args.length === 1) {
      x = args[0].x;
      y = args[0].y;
    }

    this._x = x;
    this._y = y;
    this._updatePosition(x, y);
    this._triggerPositionChange(oldX, oldY);
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
  setWidth(width, keepProportion = false) {
    throw new Error('setWidth(): This method should be implemented.');
  }

  getWidth() {
    return this.getSize().width;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  setHeight(height, keepProportion = false) {
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

  /**
   * If the current shape can be connected with other shape.
   * @param {Port.MODE} mode The connection mode.
   * @param {Shape} [otherShape = null] The shape to be connected with. If it's not provided the evaluation will be made bsed on the direction for any kind of Shape.
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  canAcceptConnection(mode, shape = null) {
    return true;
  }

  getPortPoint(position) {
    const { x, y } = this.getCurrentPosition();
    const { orientation, direction } = getPositionProps(position);
    const xOffset = orientation === PORT_ORIENTATION.X ? this.getWidth() / 2 : 0;
    const yOffset = orientation === PORT_ORIENTATION.Y ? this.getHeight() / 2 : 0;

    return {
      x: x + (xOffset * direction),
      y: y + (yOffset * direction),
    };
  }

  getPort(position) {
    return this._ports[position];
  }

  addOutgoingConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('addOutgoingConnection(): invalid parameter.');
    }

    const otherShape = connection.getDestShape();
    let result = false;

    if (this.canAcceptConnection(PORT_MODE.ORIG, otherShape)) {
      result = connection.getOrigShape() !== this ? connection.connect(this, otherShape) : true;

      if (result) {
        this._connections.add(connection);
      }
    }

    return result;
  }

  getOutgoingConnections() {
    return new Set([...this._connections].filter((i) => i.getOrigShape() === this));
  }

  addIncomingConnection(connection) {
    if (!(connection instanceof Connection)) {
      throw new Error('addOutgoingConnection(): invalid parameter.');
    }

    const otherShape = connection.getOrigShape();
    let result = false;

    if (this.canAcceptConnection(PORT_MODE.DEST, otherShape)) {
      result = connection.getDestShape() !== this ? connection.connect(otherShape, this) : true;

      if (result) {
        this._connections.add(connection);
      }
    }

    return result;
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

  assignConnectionToPort(connection, portIndex, mode) {
    this._removeFromPorts(connection);
    this._ports[portIndex].addConnection(connection, mode);

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

  remove() {
    const { _canvas } = this;

    if (_canvas) {
      this.removeConnections();
      super.remove();
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

  getConnectionPort(target, mode) {
    const isShape = target instanceof Shape;
    const otherPosition = isShape ? target.getPosition() : target.point;
    const bounds = this.getBounds();
    const position = this.getCurrentPosition();
    let relativePosition = Geometry.getNormalizedPosition(
      mode === PORT_MODE.ORIG ? position : otherPosition,
      mode === PORT_MODE.ORIG ? otherPosition : position,
    );
    let overlapX = false;
    let overlapY = false;
    let orientation;

    if (isShape) {
      const overlap = Geometry.getOverlappedDimensions(
        bounds,
        target.getBounds(),
      );

      overlapX = overlap.x;
      overlapY = overlap.y;
    } else {
      if (Geometry.isInBetween(target.point.x, bounds.left, bounds.right)) {
        overlapX = true;
      }

      if (Geometry.isInBetween(target.point.y, bounds.top, bounds.bottom)) {
        overlapY = true;
      }
    }

    if (overlapX && overlapY) {
      orientation = mode === PORT_MODE.ORIG ? PORT_ORIENTATION.X : PORT_ORIENTATION.Y;
    } else {
      if (mode === PORT_MODE.DEST) {
        relativePosition = {
          x: relativePosition.x * -1,
          y: relativePosition.y * -1,
        };
      }

      if (overlapX === overlapY) {
        orientation = mode === PORT_MODE.ORIG ? ORIENTATION.Y : ORIENTATION.X;
      } else if (relativePosition.x === 0) {
        orientation = PORT_ORIENTATION.Y;
      } else if (relativePosition.y === 0) {
        orientation = PORT_ORIENTATION.X;
      } else {
        orientation = overlapX ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X;
      }
    }

    const ports = getPortPriorityOrder(orientation, relativePosition);
    const portIndex = ports.find((port) => this.hasAvailablePortFor(port, mode));

    return portIndex !== null ? this.getPort(portIndex) : null;
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
      connection.make();
    });

    return this;
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    super._createHTML();

    this._html.classList.add('shape');
    this._html.setAttribute('transform', `translate(${this._x}, ${this._y})`);
    this._html.insertBefore(this._dom.mainElement, this._dom.title);

    this._connectivityBehavior.attachBehavior();
    this._dragBehavior.attachBehavior();
    this._resizeBehavior.attachBehavior();
    this._editableBehavior.attachBehavior();

    return this;
  }
}

export default Shape;
