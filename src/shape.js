class BPMNShape extends BPMNElement {

    static get PORT_INDEX() {
        return {
            NORTH: 0,
            EAST: 1,
            SOUTH: 2,
            WEST: 3
        };
    }

    constructor(settings) {
        super(settings);
        this._width = null;
        this._height = null;
        this._x = null;
        this._y = null;
        this._connections = new Set();
        this._ports = [];
        this.__bulkAction = false;

        settings = jQuery.extend({
            position: {
                x: 0,
                y: 0
            }
        }, settings);

        this._initPorts()
            .setPosition(settings.position.x, settings.position.y)
            .setSize(settings.width, settings.height);
    }

    _initPorts() {
        let index;

        for (let port_position in BPMNShape.PORT_INDEX) {
            let index = BPMNShape.PORT_INDEX[port_position];

            this._ports[index] = new Port({
                shape: this,
                orientation: index % 2,
                direction: index < 2 ? (index % 2 || -1) : (index % 2 ? -1 : 1)
            });
        }

        return this;
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

    getPorts () {
        return this._ports.map((port, index) => {
            let descriptor = port.getDescriptor();
            descriptor.position = index;

            return descriptor;
        });
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

    _removeFromPorts(connection) {
        for (let port of this._ports) {
            port.removeConnection(connection);
        }
        return this;
    }

    removeConnection(connection) {
        if (this._connections.delete(connection)) {
            this._removeFromPorts(connection);
            if (connection.isConnectedWith(this)) {
                connection.disconnect();
            }
        }
        return this;
    }

    getPortDirection(port) {
        let direction = this._ports.indexOf(port);

        if (direction < 0) {
            throw new Error('getPortDirection(): supplied port doesn\'t belong to this shape.');
        }

        return direction;
    }

    assignConnectionToPort(connection, portIndex) {
        this._ports[portIndex].addConnection(connection);

        return this;
    }

    getPort(connection) {
        let mode = connection.getDestShape() === this ? Port.MODE.IN : Port.MODE.OUT,
            shape = mode === Port.MODE.IN ? connection.getOrigShape() : connection.getDestShape(),
            shapePos = shape.getPosition(),
            gapX = shapePos.x - this._x,
            gapY = shapePos.y - this._y,
            relativeX = gapX > 0 ? -1 : (gapX < 0 ? 1 : 0),
            relativeY = gapY > 0 ? -1 : (gapY < 0 ? 1: 0),
            priorityPortsX = relativeX > 0 ? [BPMNShape.PORT_INDEX.WEST, BPMNShape.PORT_INDEX.EAST] : [BPMNShape.PORT_INDEX.EAST, BPMNShape.PORT_INDEX.WEST],
            priorityPortsY = relativeY > 0 ? [BPMNShape.PORT_INDEX.NORTH, BPMNShape.PORT_INDEX.SOUTH] : [BPMNShape.PORT_INDEX.SOUTH, BPMNShape.PORT_INDEX.NORTH],
            priorityPorts,
            selectedPort;

        gapX = Math.abs(gapX);
        gapY = Math.abs(gapY);

        if (gapX === 0 || gapY > gapX) {
            priorityPortsY.splice(1, 0, priorityPortsX[0], priorityPortsX[1]);
            priorityPorts = priorityPortsY;
        } else {
            priorityPortsX.splice(1, 0, priorityPortsY[0], priorityPortsY[1]);
            priorityPorts = priorityPortsX;
        }

        priorityPorts.forEach(i => {
            let port = this._ports[i];

            port.removeConnection(connection);

            if (!selectedPort && (port.mode === mode || port.mode === null)) {
                selectedPort = port;
                this.assignConnectionToPort(connection, i);
            }
        });

        return selectedPort;
    }

    getBounds() {
        var half_width = this._width / 2,
            half_height = this._height / 2;

        return {
            top: this._y - half_height,
            right: this._x + half_width,
            bottom: this._y + half_height,
            left: this._x - half_width
        };
    }

    useConnection(connection) {
        return this._connections.has(connection);
    }

    _resetPorts() {
        for (let port of this._ports) {
            port.reset();
        }
        return this;
    }

    _drawConnections() {
        this._resetPorts();
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
        tspan.style.pointerEvents = 'none';

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
