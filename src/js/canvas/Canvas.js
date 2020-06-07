import Element from '../core/Element';
import EventBus, { stopPropagation } from './EventBus';
import FluidDraggingAreaBehavior from '../behavior/FluidDraggingAreaBehavior';
import ConnectivityAreaBehavior from '../behavior/ConnectivityAreaBehavior';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';
import { MODE as PORT_MODE } from '../connection/Port';
import SelectionAreaBehavior from '../behavior/SelectionAreaBehavior';
import KeyboardControlBehavior from '../behavior/KeyboardControlBehavior';
import CommandFactory, { PRODUCTS as COMMAND_PRODUCTS } from '../command/CommandFactory';
import CommandManager from '../command/CommandManager';
import Component, { EVENT as COMPONENT_EVENT } from '../component/Component';

const DEFAULTS = Object.freeze({
  stackSize: 10,
});

class Canvas extends Element {
  constructor(settings) {
    super(settings);
    settings = { ...settings, ...DEFAULTS };
    this._width = null;
    this._height = null;
    this._shapes = new Set();
    this._connections = new Set();
    this._dom = {};
    this._eventBus = new EventBus();
    this._selectedItems = new Set();
    this._selectionBehavior = new SelectionAreaBehavior(this);
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
      .setHeight(settings.height)

    this.setElements(settings.elements);
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
      this._shapes.delete(removedElement) || this._connections.delete(removedElement);
      this.removeEventListener(COMPONENT_EVENT.REMOVE, removedElement, this._onElementRemove, this);
    }
  }

  _drawElement(element) {
    if (this._html) {
      this._dom.componentsLayer.appendChild(element.getHTML());
      this._dom.uiLayer.appendChild(element.getUIHTML());
    }
  }

  // TODO: addElement can add Connection instances too, does it make sense?
  // Connections MAYBE should be created implicitly at creating a connection between two shapes.
  addElement(element) {
    if (!this.hasElement(element)) {
      if (element instanceof Shape) {
        this._shapes.add(element);
      } else if (element instanceof Connection) {
        this._connections.add(element);
      } else {
        throw new Error('addElement(): Invalid parameter.');
      }

      element.setCanvas(this);
      this._drawElement(element);
      this.addEventListener(COMPONENT_EVENT.REMOVE, element, this._onElementRemove, this);
    }

    return this;
  }

  // TODO: addElement and this method do the same, with the expection that this one execute de addition as a command,
  // so for allow undo/redo this method should be used. In a future a canvas' wrapper should be applied (Diagram?) and
  // move this method (and all the ones that execute commands to it).
  addShape(shape) {
    // TODO: make support shape as a string too.
    if (!this.findShape(shape)) {
      const command = CommandFactory.create(COMMAND_PRODUCTS.SHAPE_ADD, this, shape);

      this._executeCommand(command);
    }
  }

  removeElement(element) {
    const elementToRemove = this.findShape(element) || this.findConnection(element);
    let command;

    if (elementToRemove && elementToRemove instanceof Shape) {
      command = CommandFactory.create(COMMAND_PRODUCTS.SHAPE_REMOVE, elementToRemove);
    } else if (elementToRemove && elementToRemove instanceof Connection) {

    }

    if (command) {
      this._executeCommand(command);
    }
  }

  hasElement(element) {
    return this._shapes.has(element) || this._connections.has(element);
  }

  clearElements() {
    this._shapes.forEach((i) => {
      i.remove();
    });
    return this;
  }

  setElements(elements) {
    this.clearElements();
    elements.forEach((i) => this.addElement(i));

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
    this._eventBus.addListener.apply(this._eventBus, arguments);
    return this;
  }

  removeEventListener(eventName, targetOrCallback, callbackOrScope = null, scope = null) {
    this._eventBus.removeListener.apply(this._eventBus, arguments);
    return this;
  }

  // TODO: Make this method internal
  dispatchEvent(eventName, target, ...args) {
    this._eventBus.dispatch(eventName, target, ...args);
    return this;
  }

  connect(origin, destination) {
    this._connectivityAreaBehavior.connect(origin, destination);

    return this;
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

  _executeCommand(command) {
    this._commandManager.executeCommand(command);
  }

  setShapePosition(shape, ...position) {
    const command = CommandFactory.create(COMMAND_PRODUCTS.SHAPE_POSITION, shape, ...position);
    this._executeCommand(command);
  }

  setShapeSize(shape, ...args) {
    let [width, height, direction] = args;

    if (typeof args[0] === 'object') {
      width = args[0].width;
      height = args[0].height;
      [, direction] = args;
    }

    const command = CommandFactory.create(COMMAND_PRODUCTS.SHAPE_RESIZE, shape, { width, height }, direction);
    this._executeCommand(command);
  }

  setShapeText(shape, text) {
    const command = CommandFactory.create(COMMAND_PRODUCTS.SHAPE_TEXT, shape, text);
    this._executeCommand(command);
  }

  undo() {
    this._commandManager.undo();
  }

  redo() {
    this._commandManager.redo();
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    const svg = Element.createSVG('svg');
    const root = Element.createSVG('g');
    const componentsLayer = Element.createSVG('g');
    const uiLayer = Element.createSVG('g');

    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('class', 'bpmn-canvas');
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
    this._selectionBehavior.attachBehavior();
    this._connectivityAreaBehavior.attachBehavior();
    this._draggingAreaBehavior.attachBehavior();
    this._keyboardBehavior.attachBehavior();

    // TODO: This only draws Shapes, when working on DS-145 connections should be considered too.
    this._shapes.forEach((element) => this._drawElement(element));

    return this.setID(this._id);
  }
}

export default Canvas;
