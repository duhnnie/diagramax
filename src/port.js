class Port {
    static get ORIENTATION() {
      return {
          VERTICAL: 0,
          HORIZONTAL: 1
      };
    }

    static get DIRECTION() {
        return {
            BACKWARD: -1,
            FORWARD: 1
        };
    }

    static get MODE() {
        return {
            IN: 0,
            OUT: 1
        }
    }

    constructor(settings) {
        this._mode = null;
        this._orientation = null;
        this._direction = null;
        this._connections = new Set();
        this._shape = null;

        settings = jQuery.extend({
            connections: [],
            shape: null
        }, settings);

        this.setShape(settings.shape)
            .setOrientation(settings.orientation)
            .setDirection(settings.direction)
            .setConnections(settings.connections);
    }

    get mode() {
        return this._mode;
    }

    get orientation() {
        return this._orientation;
    }

    get direction() {
        return this._direction;
    }

    get size() {
        return this._connections.size;
    }

    setShape(shape) {
        if (!(shape instanceof BPMNShape)) {
            throw new Error('setShape(): invalid parameter.');
        }

        this._shape = shape;
        return this;
    }

    setOrientation(orientation) {
        if (!Object.keys(Port.ORIENTATION).find(i => Port.ORIENTATION[i] === orientation)) {
            throw new Error('setOrientation(): invalid parameter.');
        }

        this._orientation = orientation;
        return this;
    }

    setDirection(direction) {
        if (!Object.keys(Port.DIRECTION).find(i => Port.DIRECTION[i] === direction)) {
            throw new Error('setDirection(): invalid parameter.');
        }

        this._direction = direction;
        return this;
    }

    addConnection(connection) {
        let newMode;

        if (!connection instanceof Connection) {
            throw new Error("addConnection(): Invalid parameter.");
        } else if (!this._shape.useConnection(connection)) {
            throw new Error('addConnection(): the supplied connection doesn\'t belong to this shape.');
        }

        newMode = connection.getOrigShape() === this._shape ? Port.MODE.OUT : Port.MODE.IN;

        if (newMode !== this._mode && this._mode !== null) {
            throw new Error('addConnection(): Invalid connection direction.');
        }

        this._mode = newMode;
        this._connections.add(connection);
        return this;
    }

    setConnections(connections) {
        for (let connection in connections) {
            this.addConnection(connection);
        }
        return this;
    }

    hasConnection(connection) {
        return this._connections.has(connection);
    }

    removeConnection(connection) {
        if (this._connections.delete(connection)) {
            this._mode = this._connections.size ? this._mode : null;
        }
        return this;
    }

    clearConnections() {
        this._connections.clear();
        this._mode = null;
        return this;
    }

    getDescriptor() {
        return {
            orientation: this._orientation,
            direction: this._direction,
            mode: this._mode,
            point: this.getConnectionPoint()
        };
    }

    getConnectionPoint() {
        var shapePosition = this._shape.getPosition(),
            orientation = this._orientation,
            direction = this._direction,
            xOffset = orientation ? this._shape.getWidth() / 2 : 0,
            yOffset = !orientation ? this._shape.getHeight() / 2 : 0;

        return {
            x: shapePosition.x + (xOffset * direction),
            y: shapePosition.y + (yOffset * direction)
        };
    }
}
