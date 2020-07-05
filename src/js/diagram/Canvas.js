import BaseElement from '../core/BaseElement';
import EventBus, { stopPropagation } from './EventBus';
import FluidDraggingAreaBehavior from '../behavior/FluidDraggingAreaBehavior';
import ConnectivityAreaBehavior from '../behavior/ConnectivityAreaBehavior';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';
import { MODE as PORT_MODE } from '../connection/Port';
import SelectionAreaBehavior from '../behavior/SelectionAreaBehavior';
import KeyboardControlBehavior from '../behavior/KeyboardControlBehavior';
import CommandFactory from '../command/CommandFactory';
import CommandManager from '../command/CommandManager';
import { EVENT as ELEMENT_EVENT } from './DiagramElement';
import { noop } from '../utils/Utils';
import ContextMenuBehavior from '../behavior/ContextMenuBehavior';
import DiagramElementFactory, { PRODUCTS as ELEMENTS } from './DiagramElementFactory';

const DEFAULTS = Object.freeze({
  stackSize: 10,
  onChange: noop,
  onContextMenu: noop,
  onElementContextMenu: noop,
});

class Canvas extends BaseElement {
  static get type() {
    return 'canvas';
  }

  constructor(settings) {
    super(settings);
    settings = { ...DEFAULTS, ...settings };
    this._width = null;
    this._height = null;
    this._shapes = new Set();
    this._connections = new Set();
    this._dom = {};
    this._eventBus = new EventBus();
    this._selectedItems = new Set();
    this._onChange = settings.onChange;
    this._onContextMenu = settings.onContextMenu;
    this._onElementContextMenu = settings.onElementContextMenu;
    this._selectionBehavior = new SelectionAreaBehavior(this);
    this._contextMenuBehavior = new ContextMenuBehavior(this);
    this._draggingAreaBehavior = new FluidDraggingAreaBehavior(this);
    this._connectivityAreaBehavior = new ConnectivityAreaBehavior(this);
    this._keyboardBehavior = new KeyboardControlBehavior(this);
    this._commandManager = new CommandManager({ size: settings.stackSize });

    settings = {
      width: 800,
      height: 600,
      onReady: null,
      elements: [],
      ...settings,
    };

    this.setWidth(settings.width)
      .setHeight(settings.height);

    this.setShapes(settings.shapes);
  }

  setWidth(width) {
    if (typeof width !== 'number') {
      throw new Error('setWidth(): invalid parameter.');
    }
    this._width = width;

    if (this._html) {
      this._html.setAttribute('width', this._width);
    }

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

    if (this._html) {
      this._html.setAttribute('height', this._height);
    }

    return this;
  }

  getHeight() {
    return this._height;
  }

  _onElementRemove(customEvent) {
    const removedElement = customEvent.target;

    if (this.hasElement(removedElement)) {
      if (!this._shapes.delete(removedElement)) {
        this._connections.delete(removedElement);
      }
      this.removeEventListener(ELEMENT_EVENT.REMOVE, removedElement, this._onElementRemove, this);
    }
  }

  _drawElement(element) {
    if (this._html) {
      this._dom.componentsLayer.appendChild(element.getHTML());
      this._dom.uiLayer.appendChild(element.getUIHTML());
    }
  }

  addShape(shape, ...args) {
    if (!(shape instanceof Shape)) {
      let type;

      if (typeof shape === 'string') {
        type = shape;
      } else if (typeof shape === 'object') {
        type = shape.type;
      } else {
        throw new Error('invalid parameters.');
      }

      shape = DiagramElementFactory.create(type, ...args);
    }

    if (shape instanceof Shape && !this._shapes.has(shape)) {
      this._shapes.add(shape);

      // TODO: Fix this access to protected method.
      shape._setCanvas(this);
      this._drawElement(shape);
      this.addEventListener(ELEMENT_EVENT.REMOVE, shape, this._onElementRemove, this);
    }

    return this;
  }

  // TODO: should be removed? since addElement was splitted in addShape() and connect()?
  hasElement(element) {
    return this._shapes.has(element) || this._connections.has(element);
  }

  clearShapes() {
    this._shapes.forEach((i) => {
      i.remove();
    });
    return this;
  }

  setShapes(shapes) {
    this.clearShapes();
    shapes.forEach((shape) => this.addShape(shape));

    return this;
  }

  getConnections() {
    return [...this._connections];
  }

  findShape(shape) {
    if (typeof shape === 'string') {
      return [...this._shapes].find((i) => i.getID() === shape) || null;
    }

    if (shape instanceof Shape) {
      return this._shapes.has(shape) ? shape : null;
    }

    throw new Error('findShape(): Invalid parameter.');
  }

  findConnection(connection) {
    if (typeof connection === 'string') {
      return [...this._connections].find((i) => i.getID() === connection) || null;
    }

    if (connection instanceof Connection) {
      return this._connections.has(connection) ? connection : null;
    }

    throw new Error('findConnection(): Invalid parameter.');
  }

  addEventListener(eventName, targetOrCallback, callbackOrScope = null, scope = null) {
    this._eventBus.addListener.call(this._eventBus, eventName, targetOrCallback, callbackOrScope, scope);
    return this;
  }

  removeEventListener(eventName, targetOrCallback, callbackOrScope = null, scope = null) {
    this._eventBus.removeListener.call(this._eventBus, eventName, targetOrCallback, callbackOrScope, scope);
    return this;
  }

  // TODO: Make this method internal
  dispatchEvent(eventName, target, ...args) {
    this._eventBus.dispatch(eventName, target, ...args);
    return this;
  }

  connect(origin, destination, connection = null) {
    origin = origin instanceof Shape ? origin : this.findShape(origin);
    destination = destination instanceof Shape ? destination : this.findShape(destination);

    if (!connection) {
      connection = DiagramElementFactory.create(ELEMENTS.CONNECTION);
    }

    // TODO: connection's connect() method should be set the canvas.
    if (connection.connect(origin, destination)) {
      if (!this._connections.has(connection)) {
        this._connections.add(connection);
        connection._setCanvas(this);

        this._drawElement(connection);
        this.addEventListener(ELEMENT_EVENT.REMOVE, connection, this._onElementRemove, this);
      }

      return connection;
    }

    return false;
  }

  trigger(eventName, ...args) {
    return this.dispatchEvent(eventName, this, ...args);
  }

  clientToCanvas(clientPosition) {
    const html = this._html;

    if (html) {
      const rect = html.getBoundingClientRect();
      const { x: clientX, y: clientY } = clientPosition;

      return {
        x: clientX - rect.x,
        y: clientY - rect.y,
      };
    }

    return { x: 0, y: 0 };
  }

  _connectToDragAreaBehavior(behavior, options = {}) {
    if (this._draggingAreaBehavior) {
      if (!behavior) {
        this._draggingAreaBehavior.removeDragBehavior();
      } else {
        this._draggingAreaBehavior.setDragBehavior(behavior, options);
      }
    }

    return this;
  }

  setResizingShape(shape, direction) {
    // TODO: find a better way to do this, _dragBehavior is protected
    const behavior = shape && shape._resizeBehavior;
    const options = { direction };

    return this._connectToDragAreaBehavior(behavior, options);
  }

  setDraggingShape(shape) {
    // TODO: find a better way to do this, _dragBehavior is protected
    const behavior = shape && shape._dragBehavior;

    return this._connectToDragAreaBehavior(behavior);
  }

  // TODO: this method is used for both set a connection to be dragged and to remove it.
  // maybe there should be  a dedicated method for removing.
  setDraggingConnection(connection, draggingPoint = null) {
    // TODO: Fix access to protected member
    const behavior = connection && connection._dragBehavior;
    const options = { draggingPoint };

    return this._connectToDragAreaBehavior(behavior, options);
  }

  // TODO: Does make sense to have this method?
  /**
   * @deprecated
   */
  getConnectivityAreaBehavior() {
    return this._connectivityAreaBehavior;
  }

  startConnection(shape) {
    if (this._shapes.has(shape)) {
      this._connectivityAreaBehavior.start(shape);
    }
  }

  startReconnection(connection, connectionPoint) {
    let shape;

    if (connectionPoint === PORT_MODE.ORIG) {
      shape = connection.getDestShape();
    } else {
      shape = connection.getOrigShape();
    }

    this._connectivityAreaBehavior.start(shape, connection, connectionPoint);
  }

  cancelConnection() {
    this._connectivityAreaBehavior.end();
  }

  completeConnection(shape) {
    if (this._shapes.has(shape)) {
      this._connectivityAreaBehavior.complete(shape);
    }
  }

  selectItem(item) {
    // TODO: maybe selection behavior should have the methods to set a selection and to add an item
    // to a current selection set.
    this._selectionBehavior.clear();
    this._selectionBehavior.select(item);
  }

  getSelection() {
    return this._selectionBehavior.get();
  }

  onContextMenu(event) {
    this._selectionBehavior.clear();
    this._onContextMenu(event, this);
  }

  /**
   * Executes a command, and add if its succesfully executed it is add to the undo/redo stack.
   * @see {@link CommandManager}
    */
  executeCommand(...args) {
    const [command] = args;
    const result = this._commandManager.executeCommand(...args);

    if (result) {
      const commandKey = (typeof command === 'string' && command) || CommandFactory.getProductKey(command);

      this._onChange(this, commandKey, ...args.slice(1));
    }

    return result;
  }

  undo() {
    this._commandManager.undo();

    return this._commandManager.getSteps()[0];
  }

  redo() {
    this._commandManager.redo();

    return this._commandManager.getSteps()[1];
  }

  toJSON() {
    return {
      id: this.getID(),
      shapes: [...this._shapes].map((shape) => shape.toJSON()),
      connections: [...this._connections].map((connection) => connection.toJSON()),
    };
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    const svg = BaseElement.createSVG('svg');
    const root = BaseElement.createSVG('g');
    const componentsLayer = BaseElement.createSVG('g');
    const uiLayer = BaseElement.createSVG('g');

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('class', 'canvas');
    svg.style.background = '#F0F0F0';

    root.setAttribute('transform', 'scale(1, 1)');
    root.append(componentsLayer, uiLayer);
    svg.appendChild(root);

    uiLayer.addEventListener('click', stopPropagation, false);
    uiLayer.addEventListener('dblClick', stopPropagation, false);
    componentsLayer.addEventListener('click', stopPropagation, false);
    componentsLayer.addEventListener('dblClick', stopPropagation, false);

    this._dom.uiLayer = uiLayer;
    this._dom.componentsLayer = componentsLayer;
    this._html = svg;

    this.setWidth(this._width)
      .setHeight(this._height);

    // TODO: When migrate to EventTarget dispatch and event an make the attachment on
    // the behavior itself.
    // TODO: When migrate to WebComponents attach behavior on connecting.
    this._selectionBehavior.attach();
    this._connectivityAreaBehavior.attach();
    this._draggingAreaBehavior.attach();
    this._keyboardBehavior.attach();
    this._contextMenuBehavior.attach();

    // TODO: This only draws Shapes, when working on DS-145 connections should be considered too.
    this._shapes.forEach((element) => this._drawElement(element));

    return this.setID(this._id);
  }
}

export default Canvas;
