import DiagraElement from '../diagram/DiagramElement';
import Port, {
  getPositionProps, MODE as PORT_MODE, ORIENTATION as PORT_ORIENTATION, POSITION as PORT_POSITION, ORIENTATION,
} from '../connection/Port';
import Connection from '../connection/Connection';
import EditableTextBehaviorFactory, { PRODUCTS as EDITABLE_TEXT_PRODUCTS } from '../behavior/EditableTextBehaviorFactory';
import DraggableShapeBehaviorFactory, { PRODUCTS as DRAGGABLE_PRODUCTS } from '../behavior/DraggableShapeBehaviorFactory';
import ConnectivityBehaviorFactory, { PRODUCTS as CONNECTIVITY_PRODUCTS } from '../behavior/ConnectivityBehaviorFactory';
import { EVENT as RESIZE_EVENT, DIRECTION } from '../behavior/ResizeBehavior';
import ResizeBehaviorFactory, { PRODUCTS as RESIZE_PRODUCTS } from '../behavior/ResizeBehaviorFactory';
import Geometry from '../utils/Geometry';
import ShapeUI from './ShapeUI';
import ErrorThrower from '../utils/ErrorThrower';

/*
 * Returns and array with the port indexes sorted in priority order for elegibility based on a primary orientation.
 * @param {Number} mainOrientation The orientation index that will be the assumed as the prioritized one.
 * @param {Object} Object containing the relative position, x and y respect to destination in respective axis.
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
  x: 0,
  y: 0,
  resizeBehavior: RESIZE_PRODUCTS.DEFAULT,
  connectivityBehavior: CONNECTIVITY_PRODUCTS.DEFAULT,
  dragBehavior: DRAGGABLE_PRODUCTS.DEFAULT,
  textEditBehavior: EDITABLE_TEXT_PRODUCTS.DEFAULT,
};

export const EVENT = Object.freeze({
  DRAG_START: 'drag:start',
  DRAG: 'drag',
  DRAG_END: 'drag:end',
  POSITION_CHANGE: 'position:change',
  SHAPE_CONNECT: 'shape:connect',
  SHAPE_DISCONNECT: 'shape:disconnect',
});

class Shape extends DiagraElement {
  static get type() {
    return 'shape';
  }

  constructor(settings) {
    super(settings);

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this._x = null;
    this._y = null;
    this._cx = null;
    this._cy = null;
    this._cWidth = null;
    this._cHeight = null;
    this._connections = new Set();
    this._ports = [];
    // TODO: component's text is defined in DiagramElement, so this behavior should be defined in that class.
    this._editableBehavior = EditableTextBehaviorFactory.create(settings.textEditBehavior, this);
    this._dragBehavior = DraggableShapeBehaviorFactory.create(settings.dragBehavior, this);
    this._connectivityBehavior = ConnectivityBehaviorFactory.create(settings.connectivityBehavior, this);
    this._resizeBehavior = ResizeBehaviorFactory.create(settings.resizeBehavior, this);

    this._initPorts()
      .setPosition(settings.x, settings.y);
  }

  _setCanvas(canvas) {
    if (this._canvas !== canvas) {
      super._setCanvas(canvas);
      canvas.addShape(this);
    }

    return this;
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
    const canvas = this.getCanvas();
    const oldPosition = this.getPosition();
    let [x, y] = args;

    if (args.length === 1) {
      x = args[0].x;
      y = args[0].y;
    }

    this._x = x;
    this._y = y;
    this._updatePosition(x, y);

    if (canvas && (oldPosition.x !== x || oldPosition.y !== y)) {
      canvas.dispatchEvent(EVENT.POSITION_CHANGE, this, this.getPosition(), oldPosition);
    }
  }

  getPosition() {
    return {
      x: this._x,
      y: this._y,
    };
  }

  _updateSize(width, height) {
    this._cWidth = width;
    this._cHeight = height;

    return this._drawConnections();
  }

  _updateWidth(width) {
    const { height } = this.getCurrentSize();

    this._updateSize(width, height);
  }

  _updateHeight(height) {
    const { width } = this.getCurrentSize();

    this._updateSize(width, height);
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  setWidth(width, keepProportion = false) {
    ErrorThrower.notImplemented();
  }

  getWidth() {
    return this.getSize().width;
  }

  // eslint-disable-next-line no-unused-vars, class-methods-use-this
  setHeight(height, keepProportion = false) {
    ErrorThrower.notImplemented();
  }

  getHeight() {
    return this.getSize().height;
  }

  // TODO: is this useful?
  getRatio() {
    return this.getWidth() / this.getHeight();
  }

  _mapSize(width, height) {
    this._width = width;
    this._height = height;
  }

  setSize(...args) {
    const oldSize = this.getSize();
    let [width, height] = args;

    if (args.length === 1) {
      width = args[0].width;
      height = args[0].height;
    }

    this._mapSize(width, height);
    this._updateSize(width, height);

    const canvas = this.getCanvas();

    if (canvas && (width !== oldSize.width || height !== oldSize.height)) {
      canvas.dispatchEvent(RESIZE_EVENT.SIZE_CHANGE, this, {
        previous: oldSize,
        current: { width, height },
      });
    }
  }

  getCurrentSize() {
    return {
      width: this._cWidth,
      height: this._cHeight,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getBounds() {
    ErrorThrower.notImplemented();
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
   * @param {Shape} [otherShape = null] The shape to be connected with. If it's not provided the evaluation will be
   * made based on the direction for any kind of Shape.
   */
  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  canAcceptConnection(mode, shape = null) {
    return true;
  }

  getPortPoint(position) {
    const { x, y } = this.getCurrentPosition();
    const { orientation, direction } = getPositionProps(position);
    const { width, height } = this.getCurrentSize();
    const xOffset = orientation === PORT_ORIENTATION.X ? width / 2 : 0;
    const yOffset = orientation === PORT_ORIENTATION.Y ? height / 2 : 0;

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
      ErrorThrower.invalidParameter();
    }

    const otherShape = connection.getDestShape();
    let result = false;

    if (this.canAcceptConnection(PORT_MODE.ORIG, otherShape)) {
      result = connection.getOrigShape() !== this ? connection.connect(this, otherShape) : true;

      if (result) {
        this._connections.add(connection);
        this.getCanvas().dispatchEvent(EVENT.SHAPE_CONNECT, this, {
          otherShape,
          connection,
          mode: PORT_MODE.DEST,
        });
      }
    }

    return result;
  }

  getOutgoingConnections() {
    return new Set([...this._connections].filter((i) => i.getOrigShape() === this));
  }

  addIncomingConnection(connection) {
    if (!(connection instanceof Connection)) {
      ErrorThrower.invalidParameter();
    }

    const otherShape = connection.getOrigShape();
    let result = false;

    if (this.canAcceptConnection(PORT_MODE.DEST, otherShape)) {
      result = connection.getDestShape() !== this ? connection.connect(otherShape, this) : true;

      if (result) {
        this._connections.add(connection);
        this.getCanvas().dispatchEvent(EVENT.SHAPE_CONNECT, this, {
          otherShape,
          connection,
          mode: PORT_MODE.ORIG,
        });
      }
    }

    return result;
  }

  getIncomingConnections() {
    return new Set([...this._connections].filter((i) => i.getDestShape() === this));
  }

  getConnectedShapes() {
    const connectedShapes = new Set();

    this._connections.forEach((connection) => {
      const origShape = connection.getOrigShape();
      const isOrigShape = this === origShape;
      const otherShape = isOrigShape ? connection.getDestShape() : origShape;

      connectedShapes.add([
        otherShape,
        isOrigShape ? PORT_MODE.DEST : PORT_MODE.ORIG,
      ]);
    });

    return connectedShapes;
  }

  /**
   *
   * @param {Connection} connection The connection to remove from Shape's ports or port.
   * @param {Port.MODE} [mode] The mode for the ports the connection will be removed from. If not specified, all ports
   * will be considered.
   * @returns {Boolean} If all connection references were removed. When no supplying `mode` parameter this will always
   * be true.
   */
  _removeFromPorts(connection, mode = null) {
    let stillExists = false;

    this._ports.forEach((port) => {
      if (port.hasConnection(connection)) {
        if ((mode === null || port.mode === mode)) {
          port.removeConnection(connection);
        } else {
          stillExists = true;
        }
      }
    });

    return !stillExists;
  }

  removeConnection(connection, mode = null) {
    if (this._connections.has(connection)) {
      const destShape = connection.getDestShape();
      const otherShape = destShape === this ? connection.getOrigShape() : destShape;
      const allRemoved = this._removeFromPorts(connection, mode);

      if (allRemoved) {
        this._connections.delete(connection);

        if (connection.isConnectedWith(this)) {
          connection.disconnect();
        }

        this.getCanvas().dispatchEvent(EVENT.SHAPE_DISCONNECT, this, {
          connection,
          otherShape,
          mode,
        });
      }
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
    this._removeFromPorts(connection, mode);
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
    const { width, height } = this.getCurrentSize();
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

    this._updatePosition(x, y);
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

  toJSON() {
    return {
      ...super.toJSON(),
      x: this._x,
      y: this._y,
      width: this.getWidth(),
      height: this.getHeight(),
    };
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    super._createHTML();

    this._html.classList.add('shape');
    this._html.setAttribute('transform', `translate(${this._x}, ${this._y})`);
    // this._html.insertBefore(this._dom.mainElement, this._dom.title);

    this._connectivityBehavior.attach();
    this._dragBehavior.attach();
    this._resizeBehavior.attach();
    this._editableBehavior.attach();

    return this;
  }
}

export default Shape;
