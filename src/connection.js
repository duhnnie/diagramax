class Connection extends BPMNElement {
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

    _getWaypoints(origPort, destPort) {
        let origPoint = origPort.getConnectionPoint(),
            destPoint = destPort.getConnectionPoint(),
            initDirection = origPort.direction % 2, // 0: vertical 1: horizontal
            finalDirection = destPort.direction % 2,
            constantOffset = 20,
            points = [],
            lastPoints = [],
            gap;

        points.push(origPoint);
        lastPoints.push(destPoint);

        let relativeX = origPoint.x <= destPoint.x ? 1 : -1,
            relativeY = origPoint.y <= destPoint.y ? 1 : -1;

        if (origPort.direction === Port.DIRECTION.NORTH && relativeY >= 0) {
            points.push({
                x: origPoint.x,
                y: origPoint.y -  constantOffset
            });
        } else if (origPort.direction === Port.DIRECTION.EAST && relativeX < 0) {
            points.push({
                x: origPoint.x +  constantOffset,
                y: origPoint.y
            });
        } else if (origPort.direction === Port.DIRECTION.SOUTH && relativeY < 0) {
            points.push({
                x: origPoint.x,
                y: origPoint.y +  constantOffset
            });
        } else if (origPort.direction === Port.DIRECTION.WEST && relativeX >= 0) {
            points.push({
                x: origPoint.x -  constantOffset,
                y: origPoint.y
            });
        }

        if (points.length > 1) {
            initDirection = (origPort.direction + 1) % 2;
        }

        if (destPort.direction === Port.DIRECTION.NORTH && relativeY < 0) {
            lastPoints.unshift({
                x: destPoint.x,
                y: destPoint.y -  constantOffset
            });
        } else if (destPort.direction === Port.DIRECTION.EAST && relativeX >= 0) {
            lastPoints.unshift({
                x: destPoint.x +  constantOffset,
                y: destPoint.y
            });
        } else if (destPort.direction === Port.DIRECTION.SOUTH && relativeY >= 0) {
            lastPoints.unshift({
                x: destPoint.x,
                y: destPoint.y +  constantOffset
            });
        } else if (destPort.direction === Port.DIRECTION.WEST && relativeX < 0) {
            lastPoints.unshift({
                x: destPoint.x - constantOffset,
                y: destPoint.y
            });
        }

        origPoint = points[points.length - 1];
        destPoint = lastPoints[0] || destPoint;

        if (lastPoints.length > 1) {
            finalDirection = (destPort.direction + 1) % 2;
        }

        if (initDirection === finalDirection) {
            gap = (initDirection ? Math.abs(origPoint.x - destPoint.x) : Math.abs(origPoint.y - destPoint.y)) / 2;

            if (gap < constantOffset) {
                points.push({
                    x: origPoint.x + (initDirection * constantOffset * relativeX),
                    y: origPoint.y + (initDirection ? 0 : constantOffset * relativeY)
                });

                lastPoints.unshift({
                    x: destPoint.x - (finalDirection * constantOffset * relativeX),
                    y: destPoint.y - (finalDirection ? 0 : constantOffset * relativeY)
                });

                origPoint = points[points.length - 1];
                destPoint = lastPoints[0];

                initDirection = finalDirection = (initDirection + 1) % 2;
                gap = (initDirection ? Math.abs(origPoint.x - destPoint.x) : Math.abs(origPoint.y - destPoint.y)) / 2;
            }

            points.push(
                {
                    x: origPoint.x + (gap * initDirection * relativeX),
                    y: origPoint.y + (initDirection ? 0 : gap * relativeY)
                },
                {
                    x: destPoint.x - (finalDirection ? gap * relativeX : 0),
                    y: destPoint.y - (finalDirection ? 0 : gap * relativeY)
                }
            );
        } else {
            points.push({
                x: initDirection ? destPoint.x : origPoint.x,
                y: initDirection ? origPoint.y : destPoint.y
            });
        }

        return points.concat(lastPoints);
    }

    connect() {
        let origPoint,
            destPoint,
            gapX,
            gapY,
            origPort,
            destPort,
            point,
            paths,
            path,
            previousPoint;

        if (this._html) {
            let waypoints,
                i;

            origPort = this._origShape.getPort(this)
            destPort = this._destShape.getPort(this);

            waypoints = this._getWaypoints(origPort, destPort);

            console.log(this._origShape.getText() + ' -> ' + this._destShape.getText(), waypoints);

            paths = this._dom.paths || [];

            for (i = 1; i < waypoints.length; i += 1) {
                previousPoint = waypoints[i - 1];

                path = paths[i] || SVGFactory.create('line');
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
            this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${90 * destPort.direction})`);
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
