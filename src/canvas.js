import Element from './element';
import EventBus from './event_bus';
import DragAndDropManager from './drag_drop_manager';
import SVGFactory from './svg_factory';
import BPMNShape from './shape';
import Connection from './connection';

class Canvas extends Element {
    constructor(settings) {
        super(settings);
        this._width = null;
        this._height = null;
        this._shapes = new Set();
        this._connections = new Set();
        this._dom = {};
        this._eventBus = new EventBus();
        this._onSelectShapeHandler = null;
        this._dragAndDropManager = null;

        settings = $.extend({
            width: 800,
            height: 600,
            onSelectShape: null,
            onReady: null,
            elements: []
        }, settings);

        this.setWidth(settings.width)
            .setHeight(settings.height)
            .setOnSelectShapeCallback(settings.onSelectShape);

        this._dragAndDropManager = new DragAndDropManager(this);

        this.setElements(settings.elements);
    }

    setWidth(width) {
        if (typeof width !== 'number') {
            throw new Error('setWidth(): invalid parameter.');
        }
        this._width = width;

        if (this._html) {
            this._html.setAttribute("width", this._width);
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
            this._html.setAttribute("height", this._height);
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
            this._dragAndDropManager.registerShape(element);

            if (this._html) {
                this._dom.container.appendChild(element.getHTML());
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
            this._dragAndDropManager.unregisterShape(element);
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
        return [...this._shapes].find(i => i.getID() === id) || [...this._connections].find(i => i.getID() === id);
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

    connect(origin, destination, connection_id) {
        let connection;
        origin = origin instanceof BPMNShape ? origin : this.getElementById(origin);
        destination = destination instanceof BPMNShape ? destination : this.getElementById(destination);

        if (origin && destination && origin !== destination) {
            connection = new Connection({
                id: connection_id,
                canvas: this,
                origShape: origin,
                destShape: destination
            });
            if (this._html) {
                this._dom.container.appendChild(connection.getHTML());
            }
        }

        return this;
    }

    trigger(eventName, ...args) {
        return this.dispatchEvent(eventName, this, ...args);
    }

    _onSelectShape() {
        if (typeof this._onSelectShapeHandler === 'function') {
            this._onSelectShapeHandler(shape);
        }

        return this;
    }

    _createHTML() {
        let svg,
            g;

        if (this._html) {
            return this;
        }

        svg = SVGFactory.create('svg');
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
        svg.setAttribute("version", "1.1");
        svg.setAttribute("class", "bpmn-canvas")
        svg.style.background = "#F0F0F0";

        g = SVGFactory.create('g');
        g.setAttribute('transform', 'scale(1, 1)');

        svg.appendChild(g);

        this._dom.container = g;
        this._html = svg;

        this.setWidth(this._width)
            .setHeight(this._height);

        return this.setElements([...this._shapes].slice(0))
            .setID(this._id);
    }
}

export default Canvas;

