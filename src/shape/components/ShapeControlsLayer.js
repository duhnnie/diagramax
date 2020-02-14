import Element from '../../core/Element';

class ShapeControlsLayer extends Element {
  constructor(settings) {
    super(settings);

    this._target = (settings && settings.target) || null;
    this._events = new Map();
    this._handleEvent = this._handleEvent.bind(this);
  }

  _handleEvent(event) {
    const { target, type } = event;
    const eventMap = this._events.get(type);
    const listeners = eventMap.get(target);

    event.stopPropagation();

    listeners.forEach((listener) => {
      listener();
    });
  }

  _createEventMap(event) {
    let eventMap = this._events.get(event);

    if (!eventMap) {
      eventMap = new WeakMap();
      this._events.set(event, eventMap);
      this.getHTML().addEventListener(event, this._handleEvent, false);
    }
  }

  _getListenersSet(event, svgElement) {
    this._createEventMap(event);

    const eventMap = this._events.get(event);
    let listenersSet = eventMap.get(svgElement);

    if (!listenersSet) {
      listenersSet = new Set();
      eventMap.set(svgElement, listenersSet);
    }

    return listenersSet;
  }

  addControl(svgElement, events) {
    if (events) {
      Object.entries(events).forEach(([event, listeners]) => {
        const listenersArray = Array.isArray(listeners) ? listeners.slice(0) : [listeners];
        const listenersSet = this._getListenersSet(event, svgElement);

        listenersArray.forEach((listener) => listenersSet.add(listener));
      });
    }

    this.getHTML().appendChild(svgElement);
  }


  _createHTML() {
    const layer = Element.createSVG('g');

    layer.setAttribute('pointer-events', 'bounding-box');
    layer.classList.add('controls-layer');

    this._html = layer;

    return this;
  }
}

export default ShapeControlsLayer;
