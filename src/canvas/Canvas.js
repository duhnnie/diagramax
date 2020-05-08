import Element from '../core/Element';
import EventBus, { stopPropagation } from './EventBus';
import FluidDraggingAreaBehavior from '../behavior/FluidDraggingAreaBehavior';
import ConnectivityAreaBehavior from '../behavior/ConnectivityAreaBehavior';
import Shape from '../shape/Shape';
import Connection from '../connection/Connection';
import SelectionAreaBehavior from '../behavior/SelectionAreaBehavior';

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
    this._selectionBehavior = new SelectionAreaBehavior(this);
    this._draggingAreaBehavior = new FluidDraggingAreaBehavior(this);
    this._connectivityAreaBehavior = new ConnectivityAreaBehavior(this);

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

      if (this._html) {
        this._dom.componentsLayer.appendChild(element.getHTML());
        this._dom.uiLayer.appendChild(element.getUIHTML());
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
      element.unselect();
      element.remove();
    }

    return this;
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

  connect(origin, destination) {
    this._connectivityAreaBehavior.connect(origin, destination);

    return this;
  }

  trigger(eventName, ...args) {
    return this.dispatchEvent(eventName, this, ...args);
  }

  _connectToDragAreaBehavior(behavior, options = {}) {
    if (this._draggingAreaBehavior) {
      if (!behavior) {
        this._draggingAreaBehavior.removeDragBehavior();
      } else {
        // TODO: find a better way to do this, _dragBehavior is protected
        this._draggingAreaBehavior.setDragBehavior(behavior, options);
      }
    }

    return this;
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

  // TODO: Does make sense to have this method?
  getConnectivityAreaBehavior() {
    return this._connectivityAreaBehavior;
  }

  selectItem(item) {
    // TODO: maybe selection behavior should have the methods to set a selection and to add an item
    // to a current selection set.
    this._selectionBehavior.clear();
    this._selectionBehavior.select(item);
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

    this._selectionBehavior.attachBehavior();
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
