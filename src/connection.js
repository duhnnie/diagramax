class Connection extends BPMNElement {

    static get ARROW_SEGMENT_LENGTH() {
        return 20;
    }

    constructor(settings) {
        super(settings);
        this._origShape = null;
        this._destShape = null;
        this._points = [];

        settings = jQuery.extend({
            origShape: null,
            destShape: null
        }, settings);

        this.setOrigShape(settings.origShape)
            .setDestShape(settings.destShape);
    }

    _isValid(origShape, destShape) {
        return origShape !== destShape;
    }

    setOrigShape(shape) {
        if (!(shape instanceof BPMNShape)) {
            throw new Error('setOrigShape(): invalid parameter.');
        } else if (!this._isValid(shape, this._destShape)) {
            throw new Error('setOrigShape(): The origin and destiny are the same.');
        }

        if (shape !== this._origShape) {
            if (this._origShape) {
                let oldOrigShape = this._origShape;

                this._origShape = null;
                oldOrigShape.removeConnection(this);
            }

            this._origShape = shape;
            shape.addOutgoingConnection(this);

            if (this._html) {
                this.connect();
            }
        }

        return this;
    }

    getOrigShape() {
        return this._origShape;
    }

    setDestShape(shape) {
        if (!(shape instanceof BPMNShape)) {
            throw new Error('setOrigShape(): invalid parameter.');
        } else if (!this._isValid(this._origShape, shape)) {
            throw new Error('setDestShape(): The origin and destiny are the same.');
        }

        if (shape !== this._destShape) {
            if (this._destShape) {
                let oldDestShape = this._destShape;

                this._destShape = null;
                oldDestShape.removeConnection(this);
            }

            this._destShape = shape;
            shape.addIncomingConnection(this);

            if (this._html) {
                this.connect();
            }
        }

        return this;
    }

    getDestShape() {
        return this._destShape;
    }

    disconnect() {
        let origShape = this._origShape,
            destShape = this._destShape;

        this._origShape = null;
        this._destShape = null;

        if (origShape.getOutgoingConnections().has(this)) {
            origShape.removeConnection(this);
        }

        if (destShape.getIncomingConnections().has(this)) {
            destShape.removeConnection(this);
        }

        $(this._html).remove();

        return this;
    }

    isConnectedWith(shape) {
        return this._origShape === shape || this._destShape === shape;
    }

    _getWaypoints(orig, dest) {
        let relativeX = dest.point.x - orig.point.x,
            relativeY = dest.point.y - orig.point.y,
            firstPoints = [],
            lastPoints = [];

        relativeX = relativeX !== 0 ? relativeX / Math.abs(relativeX) : 0;
        relativeY = relativeY !== 0 ? relativeY / Math.abs(relativeY) : 0;

        if ((orig.orientation && orig.direction !== relativeX) || (!orig.orientation && orig.direction !== relativeY)) {
            orig = {
                point: {
                    x: orig.point.x + (orig.orientation ? Connection.ARROW_SEGMENT_LENGTH * orig.direction : 0),
                    y: orig.point.y + (!orig.orientation ? Connection.ARROW_SEGMENT_LENGTH * orig.direction : 0)
                },
                orientation: orig.orientation ? 0 : 1,
                direction: (orig.orientation ? relativeY : relativeX) || 1
            };

            firstPoints.push(orig.point);
        }

        if ((dest.orientation && dest.direction === relativeX) || (!dest.orientation && dest.direction === relativeY)) {
            dest = {
                point: {
                    x: dest.point.x + (dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0),
                    y: dest.point.y + (!dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0)
                },
                orientation: dest.orientation ? 0 : 1,
                direction: ((dest.orientation ? relativeY : relativeX) * -1) || -1
            };

            lastPoints.unshift(dest.point);
        }

        if (firstPoints.length || lastPoints.length) {
            return firstPoints.concat(this._getWaypoints(orig, dest), lastPoints);
        }

        if (orig.orientation === dest.orientation) {
            let orientation = orig.orientation;

            if ((orientation && orig.point.y === dest.point.y)
                || (!orientation && orig.point.x === dest.point.x)) {
                // points are face 2 face
                return []; // There's no intermediate points.
            } else {
                let primaryGap = orientation ? Math.abs(dest.point.x - orig.point.x) : Math.abs(dest.point.y - orig.point.y),
                    secondaryGap = orientation ? Math.abs(dest.point.y - orig.point.y) : Math.abs(dest.point.x - orig.point.x);

                if (primaryGap / 2 < Connection.ARROW_SEGMENT_LENGTH && secondaryGap / 2 >= Connection.ARROW_SEGMENT_LENGTH) {
                    orig = {
                        point: {
                            x: orig.point.x + (orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeX : 0),
                            y: orig.point.y + (!orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeY : 0)
                        },
                        orientation: orig.orientation ? 0 : 1,
                        direction: orientation ? relativeY : relativeX
                    };

                    dest = {
                        point: {
                            x: dest.point.x + (orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeX * -1 : 0),
                            y: dest.point.y + (!orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeY * -1 : 0)
                        },
                        orientation: dest.orientation ? 0 : 1,
                        direction: (orientation ? relativeY : relativeX) * -1
                    };

                    return [orig.point].concat(this._getWaypoints(orig, dest), dest.point);
                }

                primaryGap = primaryGap / 2;

                return [{
                        x: orig.point.x + (orientation ? primaryGap * relativeX : 0),
                        y: orig.point.y + (!orientation? primaryGap * relativeY : 0)
                    }, {
                        x: dest.point.x + (orientation ? primaryGap * relativeX * -1 : 0),
                        y: dest.point.y + (!orientation ? primaryGap * relativeY * -1 : 0)
                    }];
            }
        } else {
            let gapX = Math.abs(dest.point.x - orig.point.x),
                gapY = Math.abs(dest.point.y - orig.point.y);

            if (gapX < Connection.ARROW_SEGMENT_LENGTH === gapY < Connection.ARROW_SEGMENT_LENGTH
                || ((dest.orientation && gapX >= Connection.ARROW_SEGMENT_LENGTH)
                    || (!dest.orientation && gapY >= Connection.ARROW_SEGMENT_LENGTH))) {
                return [{
                    x: orig.orientation ? dest.point.x : orig.point.x,
                    y: orig.orientation ? orig.point.y : dest.point.y
                }];
            } else {
                dest = {
                    point: {
                        x: dest.point.x + (dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0),
                        y: dest.point.y + (!dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0)
                    },
                    orientation: dest.orientation ? 0 : 1,
                    direction: (dest.orientation ? relativeY : relativeX) * -1
                };

                return this._getWaypoints(orig, dest).concat(dest.point);
            }
        }
    }

    connect() {
        let ports,
            previousPoint,
            paths;

        if (this._html) {
            let waypoints,
                i = 0;

            paths = this._dom.paths || [];
            ports = ConnectionManager.getConnectionPorts(this._origShape, this._destShape);

            if (ports.orig) {
                this._origShape.assignConnectionToPort(this, ports.orig.portIndex);
                this._destShape.assignConnectionToPort(this, ports.dest.portIndex);

                waypoints = this._getWaypoints(ports.orig, ports.dest);

                waypoints.unshift({
                    x: ports.orig.point.x,
                    y: ports.orig.point.y
                });

                waypoints.push({
                    x: ports.dest.point.x,
                    y: ports.dest.point.y
                });

                for (i = 1; i < waypoints.length; i += 1) {
                    let path = paths[i - 1] || SVGFactory.create('line');

                    previousPoint = waypoints[i - 1];

                    path.style.display = '';

                    path.setAttribute("x1", previousPoint.x);
                    path.setAttribute("y1", previousPoint.y);
                    path.setAttribute("x2", waypoints[i].x);
                    path.setAttribute("y2", waypoints[i].y);
                    path.setAttribute("stroke", "black");

                    this._html.appendChild(path);
                    paths[i - 1] = paths[i - 1] || path;
                }

                this._dom.arrow.setAttribute("transform", `translate(${waypoints[waypoints.length - 1].x}, ${waypoints[waypoints.length - 1].y})`);
                this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${90 * ports.dest.portIndex})`);
                this._dom.arrow.style.display = '';
                this._html.appendChild(this._dom.arrow);
            } else {
                this._dom.arrow.style.display = 'none';
            }

            while (i < paths.length) {
                paths[i++].style.display = 'none';
            }

            this._dom.paths = paths;
        }

        return this;
    }

    _createHTML() {
        let wrapper,
            arrowWrapper,
            arrowWrapper2,
            arrow;

        if (this._origShape === this.destShape) {
            return this;
        }

        wrapper = SVGFactory.create('g');
        wrapper.setAttribute("id", this._id);
        wrapper.setAttribute("class", "connection");

        arrowWrapper = SVGFactory.create('g');
        arrowWrapper2 = SVGFactory.create('g');
        arrowWrapper2.setAttribute("transform", "scale(0.5,0.5) rotate(-180)");
        arrow = SVGFactory.create('path');
        arrow.setAttribute("end", "target");
        arrow.setAttribute("d", "M 0 0 L -13 -26 L 13 -26 z");

        arrowWrapper2.appendChild(arrow);
        arrowWrapper.appendChild(arrowWrapper2);
        this._dom.arrow = arrowWrapper;
        this._dom.arrowRotateContainer = arrowWrapper2;

        this._html = wrapper;
        return this.connect();
    }
}
