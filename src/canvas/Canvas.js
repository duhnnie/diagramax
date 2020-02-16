import Element from '../core/Element';
import EventBus from './EventBus';
import FluidDraggingAreaBehavior from '../behavior/FluidDraggingAreaBehavior';
import ConnectivityAreaBehavior from '../behavior/ConnectivityAreaBehavior';
import BPMNShape from '../shape/Shape';
import Connection from '../connection/Connection';
import { EVENT as SELECT_EVENT } from '../behavior/SelectBehavior';

class Canvas extends Element {
  constructor(settings) {
    super(settings);
    this._width = null;
    this._height = null;
    this._shapes = new Set();
    this._connections = new Set();
    this._dom = {};
    this._eventBus = new EventBus();
    this._selectedItems = new Set();
    this._onSelectShapeHandler = null;
    this._draggingAreaBehavior = new FluidDraggingAreaBehavior(this);
    this._connectivityAreaBehavior = new ConnectivityAreaBehavior(this);

    settings = _.merge({
      width: 800,
      height: 600,
      onSelectShape: null,
      onReady: null,
      elements: [],
    }, settings);

    this.setWidth(settings.width)
      .setHeight(settings.height)
      .setOnSelectShapeCallback(settings.onSelectShape);

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

  setOnSelectShapeCallback(callback) {
    this._onSelectShapeHandler = callback;
    return this;
  }

  addElement(element) {
    if (!this.hasElement(element)) {
      if (element instanceof BPMNShape) {
        this._shapes.add(element);
      } else if (element instanceof Connection) {
        this._connections.add(element);
      } else {
        throw new Error('addElement(): Invalid parameter.');
      }

      element.setCanvas(this);
      this.addEventListener(SELECT_EVENT.SELECT, element, this._onSelectShape, this);

      if (this._html) {
        if (element instanceof Connection) {
          this._dom.container.prepend(element.getHTML());
        } else {
          this._dom.container.appendChild(element.getHTML());
        }
      }
    }

    return this;
  }

  hasElement(element) {
    return this._shapes.has(element) || this._connections.has(element);
  }

  removeElement(element) {
    if (this.hasElement(element)) {
      this._shapes.delete(element) || this._connections.delete(element);
      element.removeFromCanvas();
    }

    return this;
  }

  clearElements() {
    this._shapes.forEach((i) => {
      i.removeFromCanvas();
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

  getElementById(id) {
    return [...this._shapes].find((i) => i.getID() === id) || [...this._connections].find((i) => i.getID() === id);
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

  connect(origin, destination, connection_id = null) {
    origin = origin instanceof BPMNShape ? origin : this.getElementById(origin);
    destination = destination instanceof BPMNShape ? destination : this.getElementById(destination);

    if (origin && destination && origin !== destination) {
      const connection = new Connection({
        id: connection_id,
        canvas: this,
        origShape: origin,
        destShape: destination,
      });
    }

    return this;
  }

  trigger(eventName, ...args) {
    return this.dispatchEvent(eventName, this, ...args);
  }

  _onSelectShape(eventBusItem) {
    const shape = eventBusItem.target;

    this._selectedItems.clear();
    this._selectedItems.add(shape);

    // TODO: is this handler being used?
    // It could be better to trigger a 'onItemSelection' from canvas
    // and provide the elements that were added to selection
    // Another event for item deselection would be useful too.
    if (typeof this._onSelectShapeHandler === 'function') {
      this._onSelectShapeHandler(shape);
    }

    return this;
  }

  setDraggingShape(shape, initDragPoint = {}) {
    let { x = null, y = null } = initDragPoint;

    if (!shape) {
      this._draggingAreaBehavior.removeDragBehavior();
    } else if (shape) {
      if (x === null || y === null) {
        x = shape.getX();
        y = shape.getY();
      }
      this._draggingAreaBehavior.setDragBehavior(shape, { x, y });
    }

    return this;
  }

  getConnectivityAreaBehavior() {
    return this._connectivityAreaBehavior;
  }

  getContainer() {
    return this._dom.container;
  }

  _createHTML() {
    let svg;
    let g;

    if (this._html) {
      return this;
    }

    svg = Element.createSVG('svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svg.setAttribute('version', '1.1');
    svg.setAttribute('class', 'bpmn-canvas');
    svg.style.background = '#F0F0F0';

    g = Element.createSVG('g');
    g.setAttribute('transform', 'scale(1, 1)');

    svg.appendChild(g);

    this._dom.container = g;
    this._html = svg;

    this.setWidth(this._width)
      .setHeight(this._height);

    this._connectivityAreaBehavior.attachBehavior();
    this._draggingAreaBehavior.attachBehavior();
    // TODO: When migrate to EventTarget dispatch and event an make the attachment on
    // the behavior itself.
    // TODO: When migrate to WebComponents attach behavior on connecting.

    return this.setElements([...this._shapes].slice(0))
      .setID(this._id);
  }
}

export default Canvas;
