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

    setOrigShape(shape) {
        if (!(shape instanceof BPMNShape)) {
            throw new Error('setOrigShape(): invalid parameter.');
        }

        if (shape !== this._origShape) {
            if (this._origShape) {
                this.replaceOrigShape(shape);
            } else {
                this._origShape = shape;
                shape.addOutgoingConnection(this);

                if (this._html) {
                    this.connect();
                }
            }
        }

        return this;
    }

    getOrigShape() {
        return this._origShape;
    }

    replaceOrigShape(shape) {
        let origShape;

        if (!(shape instanceof BPMNShape)) {
            throw new Error('replaceOrigShape(): invalid parameter');
        }

        if (this._origShape !== shape) {
            origShape = this._origShape;
            this._origShape = null;

            if (origShape) {
                origShape.removeConnection(this);
            }

            this.setOrigShape(shape);
        }

        return this;
    }

    setDestShape(shape) {
        if (!(shape instanceof BPMNShape)) {
            throw new Error('setOrigShape(): invalid parameter.');
        }

        if (shape !== this._destShape) {
            if (this._destShape) {
                this.replaceDestShape(shape);
            } else {
                this._destShape = shape;
                shape.addIncomingConnection(this);

                if (this._html) {
                    this.connect();
                }
            }
        }

        return this;
    }

    getDestShape() {
        return this._destShape;
    }

    replaceDestShape(shape) {
        let destShape;

        if (!(shape instanceof BPMNShape)) {
            throw new Error('replaceOrigShape(): invalid parameter.');
        }

        if (this._destShape !== shape) {
            destShape = this._destShape;
            this._destShape = null;

            if (destShape) {
                destShape.removeConnection(this);
            }

            this.setDestShape(shape);
        }

        return this;
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

    _getPortDescriptor (port) {
        if (port instanceof Port) {
            return {
                point: port.getConnectionPoint(),
                orientation: port.orientation,
                direction: port.direction
            };
        }

        return null;
    }

    _getWaypoints(orig, dest) {
        let relativeX = dest.point.x - orig.point.x,
            relativeY = dest.point.y - orig.point.y,
            firstPoints = [],
            lastPoints = [];

        relativeX = relativeX !== 0 ? relativeX / Math.abs(relativeX) : 0;
        relativeY = relativeY !== 0 ? relativeY / Math.abs(relativeY) : 0;

        if (orig.orientation && orig.direction !== relativeX) {
            orig = {
                point: {
                    x: orig.point.x + (Connection.ARROW_SEGMENT_LENGTH * orig.direction),
                    y: orig.point.y
                },
                orientation: orig.orientation ? 0 : 1,
                direction: relativeY || 1
            };

            firstPoints.push(orig.point);
        } else if (!orig.orientation && orig.direction !== relativeY) {
            orig = {
                point: {
                    x: orig.point.x,
                    y: orig.point.y + (Connection.ARROW_SEGMENT_LENGTH * orig.direction)
                },
                orientation: orig.orientation ? 0 : 1,
                direction: relativeX || 1
            };

            firstPoints.push(orig.point);
        }

        if (dest.orientation && dest.direction === relativeX) {
            dest = {
                point: {
                    x: dest.point.x + (Connection.ARROW_SEGMENT_LENGTH * dest.direction),
                    y: dest.point.y
                },
                orientation: dest.orientation ? 0 : 1,
                direction: (relativeY * -1) || -1
            };

            lastPoints.unshift(dest.point);
        } else if (!dest.orientation && dest.direction === relativeY) {
            dest = {
                point: {
                    x: dest.point.x,
                    y: dest.point.y + (Connection.ARROW_SEGMENT_LENGTH * dest.direction)
                },
                orientation: dest.orientation ? 0 : 1,
                direction: (relativeX * -1) || -1
            };

            lastPoints.unshift(dest.point);
        }

        if (firstPoints.length || lastPoints.length) {
            return firstPoints.concat(this._getWaypoints(orig, dest), lastPoints);
        }

        if (orig.orientation === dest.orientation) {
            let orientation = orig.orientation;
            // points are facing at the same area

            if ((orientation && orig.point.y === dest.point.y)
                || (!orientation && orig.point.x === dest.point.x)) {
                // points are face 2 face
                return []; // There's no intermediate points.
            } else {
                if (orientation) {
                    let gap = Math.abs(dest.point.x - orig.point.x),
                        pointA,
                        pointB;

                    if (gap / 2 < Connection.ARROW_SEGMENT_LENGTH && Math.abs(dest.point.y - orig.point.y) / 2 >= Connection.ARROW_SEGMENT_LENGTH) {
                        pointA = {
                            point: {
                                x: orig.point.x + (Connection.ARROW_SEGMENT_LENGTH * relativeX),
                                y: orig.point.y
                            },
                            orientation: 0,
                            direction: relativeY
                        };
                        pointB = {
                            point: {
                                x: dest.point.x + (Connection.ARROW_SEGMENT_LENGTH * relativeX * -1),
                                y: dest.point.y
                            },
                            orientation: 0,
                            direction: relativeY * -1
                        };
                        firstPoints.push(pointA.point);
                        lastPoints.unshift(pointB.point);

                        return firstPoints.concat(this._getWaypoints(pointA, pointB), lastPoints);
                    }
                    gap = gap / 2;

                    pointA = {
                        x: orig.point.x + (gap * relativeX),
                        y: orig.point.y
                    };

                    pointB = {
                        x: dest.point.x + (gap * relativeX * -1),
                        y: dest.point.y
                    }

                    return [pointA, pointB];

                } else {
                    let gap = Math.abs(dest.point.y - orig.point.y),
                        pointA,
                        pointB;

                    if (gap / 2 < Connection.ARROW_SEGMENT_LENGTH && Math.abs(dest.point.x - orig.point.x) / 2 >= Connection.ARROW_SEGMENT_LENGTH) {
                        pointA = {
                            point: {
                                x: orig.point.x,
                                y: orig.point.y + (Connection.ARROW_SEGMENT_LENGTH * relativeY)
                            },
                            orientation: 1,
                            direction: relativeX
                        };
                        pointB = {
                            point: {
                                x: dest.point.x,
                                y: dest.point.y + (Connection.ARROW_SEGMENT_LENGTH * relativeY * -1)
                            },
                            orientation: 1,
                            direction: relativeX * -1
                        };
                        firstPoints.push(pointA.point);
                        lastPoints.unshift(pointB.point);

                        return firstPoints.concat(this._getWaypoints(pointA, pointB), lastPoints);
                    }

                    gap = gap / 2;

                    pointA = {
                        x: orig.point.x,
                        y: orig.point.y + (gap * relativeY)
                    };

                    pointB = {
                        x: dest.point.x,
                        y: dest.point.y + (gap * relativeY * -1)
                    }

                    return [pointA, pointB];
                }
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
                        x: dest.point.x + (dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeX * -1 : 0),
                        y: dest.point.y + (!dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeY * -1 : 0)
                    },
                    orientation: dest.orientation ? 0 : 1,
                    direction: (dest.orientation ? relativeY : relativeX) * -1
                };

                return this._getWaypoints(orig, dest).concat(dest.point);
            }
        }
    }

    connect() {
        let origPoint,
            destPoint,
            origPort,
            destPort,
            previousPoint,
            paths;

        if (this._html) {
            let waypoints,
                i;

            origPort = this._origShape.getPort(this);
            destPort = this._destShape.getPort(this);

            waypoints = this._getWaypoints(this._getPortDescriptor(origPort), this._getPortDescriptor(destPort));

            origPoint = origPort.getConnectionPoint();
            destPoint = destPort.getConnectionPoint();

            waypoints.unshift({
                x: origPoint.x,
                y: origPoint.y
            });

            waypoints.push({
                x: destPoint.x,
                y: destPoint.y
            });

            console.log(this._origShape.getText() + ' -> ' + this._destShape.getText(), waypoints);

            paths = this._dom.paths || [];

            for (i = 1; i < waypoints.length; i += 1) {
                let path = paths[i] || SVGFactory.create('line');

                previousPoint = waypoints[i - 1];

                path.style.display = '';

                path.setAttribute("x1", previousPoint.x);
                path.setAttribute("y1", previousPoint.y);
                path.setAttribute("x2", waypoints[i].x);
                path.setAttribute("y2", waypoints[i].y);
                path.setAttribute("stroke", "black");

                this._html.appendChild(path);
                paths[i] = paths[i] || path;
            }

            while (i < paths.length) {
                paths[i++].style.display = 'none';
            }

            this._dom.paths = paths;
            this._dom.arrow.setAttribute("transform", `translate(${waypoints[waypoints.length - 1].x}, ${waypoints[waypoints.length - 1].y})`);
            this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${90 * this._destShape.getPortDirection(destPort)})`);
            this._html.appendChild(this._dom.arrow);
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
