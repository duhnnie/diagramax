class Port {
    static get DIRECTION() {
        return {
            NORTH: 0,
            EAST: 1,
            SOUTH: 2,
            WEST: 3
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
        this._direction = null;
        this._connections = new Set();

        settings = jQuery.extend({
            mode: null,
            connections: []
        }, settings);

        this.setMode(settings.mode)
            .setDirection(settings.direction)
            .setConnections(settings.connections);
    }

    get direction() {
        return this._direction;
    }

    get size() {
        return this._connections.size;
    }

    setDirection(direction) {
        if (!Object.keys(Port.DIRECTION).find(i => Port.DIRECTION[i] === direction)) {
            throw new Error('setDirection(): invalid parameter.');
        }

        this._direction = direction;
        return this;
    }

    setMode(mode) {
        if (mode !== null && !Object.keys(Port.MODE).find(i => Port.MODE[i] === mode)) {
            throw new Error('setMode(): invalid parameter.');
        }

        this._mode = mode;
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

    removeConnection(connection) {
        this._connections.delete(connection);
        return this;
    }

    clearConnections() {
        this._connections.clear();
        return this;
    }

    reset() {
        return this.setMode(null)
            .clearConnections();
    }
}