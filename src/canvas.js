class Canvas extends Element {
    constructor(settings) {
        super(settings);
        this._width = null;
        this._height = null;
        this._elements = new Set();
        this._dom = {};
        this._onSelectShapeHandler = null;
        this._dragAndDropManager = null;

        settings = $.extend({
            width: 800,
            height: 600,
            onSelectShape: null,
            onReady: null
        }, settings);

        this.setWidth(settings.width)
            .setHeight(settings.height)
            .setOnSelectShapeCallback(settings.onSelectShape);

        this._dragAndDropManager = new DragAndDropManager(this);
    }

    setWidth(width) {
        if (typeof width !== 'number') {
            throw new Error('setWidth(): invalid parameter.');
        }
        this._width = width;

        if (this._html) {
            this._html.style.width = this._width;
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
            this._html.style.height = this._height;
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
        this._elements.add(element);
        this._dragAndDropManager.registerShape(element);

        if (this._html) {
            this._dom.container.appendChild(element.getHTML());
        }

        return this;
    }

    clearElements() {
        this._elements.forEach((i) => {
            try {
                this._dom.container.removeChild(i.getHTML());
            } catch (e) {}
        });
        this._elements.clear();
        return this;
    }

    setElements(elements) {
        this.clearElements();
        elements.forEach((i) => this.addElement(i));

        return this;
    }

    getElementById(id) {
        return [...this._elements].find((i) => i.getID() === id);
    }

    connect(origin, destination, connection_id) {
        let connection;
        origin = origin instanceof BPMNShape ? origin : this.getElementById(origin);
        destination = destination instanceof BPMNShape ? destination : this.getElementById(destination);

        if (origin && destination && origin !== destination) {
            connection = new Connection({
                id: connection_id,
                origShape: origin,
                destShape: destination
            });
            if (this._html) {
                this._dom.container.appendChild(connection.getHTML());
            }
        }

        return this;
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

        return this.setElements([...this._elements].slice(0))
            .setID(this._id);
    }
}