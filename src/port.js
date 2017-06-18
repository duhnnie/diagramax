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
            mode: null,
            connections: [],
            shape: null
        }, settings);

        this.setShape(settings.shape)
            .setOrientation(settings.orientation)
            .setDirection(settings.direction)
            .setConnections(settings.connections).mode = settings.mode;
    }

    set mode(mode) {
        if (mode !== null && !Object.keys(Port.MODE).find(i => Port.MODE[i] === mode)) {
            throw new Error('set mode: invalid parameter.');
        }

        this._mode = mode;
        return this;
    }

    get mode() {
        return this._mode;
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
            this.mode = this._connections.size ? this.mode : null;
        }
        return this;
    }

    clearConnections() {
        this._connections.clear();
        return this;
    }

    reset() {
        this.mode = null;
        return this.clearConnections();
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
