class BPMNShape extends BPMNElement {
    constructor(settings) {
        super(settings);
        this._width = null;
        this._height = null;
        this._x = null;
        this._y = null;
        this._connections = new Set();
        this.__bulkAction = false;

        settings = jQuery.extend({
            position: {
                x: 0,
                y: 0
            }
        }, settings);

        this.setPosition(settings.position.x, settings.position.y)
            .setSize(settings.width, settings.height);
    }

    setX(x) {
        if (typeof x !== 'number') {
            throw new Error('setX(): invalid parameter.');
        }

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
        if (typeof y !== 'number') {
            throw new Error('setY(): invalid parameter.');
        }
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
            y: this._y
        };
    }

    setWidth(width) {
        if (typeof width !== 'number') {
            throw new Error('setWidth(): invalid parameter.');
        }
        this._width = width;
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
    }

    getHeight() {
        return this._height;
    }

    setSize(width, height) {
        return this.setWidth(width)
            .setHeight(height);
    }

    getSize() {
        return {
            width: this._width,
            height: this.height
        };
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
        return new Set([...this._connections].filter(i => i.getOrigShape() === this));
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
        return new Set([...this._connections].filter(i => i.getDestShape() === this));
    }

    getConnectedShapes() {
        let prev = [],
            next = [];

        return {
            prev: [...this.getIncomingConnections()].map(i => i.getOrigShape()),
            next: [...this.getOutgoingConnections()].map(i => i.getDestShape())
        };
    }

    removeConnection(connection) {
        if (this._connections.delete(connection)) {
            if (connection.isConnectedWith(this)) {
                connection.disconnect();
            }
        }
        return this;
    }

    _drawConnections() {
        for (let connection of this._connections) {
            connection.connect();
        }
        return this;
    }

    _createHTML() {
        let wrapper,
            title,
            text,
            tspan;

        if (this._html) {
            return this;
        }

        wrapper = SVGFactory.create('g');
        wrapper.setAttribute('transform', `translate(${this._x}, ${this._y})`);
        wrapper.setAttribute('class', 'shape');

        title = document.createElement('title');
        text = SVGFactory.create('text');
        tspan = SVGFactory.create('tspan');

        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('y', '0.5em');

        text.appendChild(tspan);
        wrapper.appendChild(title);
        wrapper.appendChild(text);

        this._dom.title = title;
        this._dom.text = tspan;
        this._dom.textContent = text;

        this._html = wrapper;

        if (this._dom.shapeElement) {
            this._dom.shapeElement.setAttribute("cursor", "pointer");
        }

        return this.setText(this._text)
                .setID(this._id);
    }
}