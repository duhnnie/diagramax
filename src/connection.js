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
                    this._connect();
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
                    this._connect();
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

    _connect() {
        let origPos,
            destPos,
            gapX,
            gapY,
            points = [],
            destPort = {},
            origPort = {},
            dx,
            dy,
            path,
            paths;

        origPos = this._origShape.getPosition();
        destPos = this._destShape.getPosition();

        gapX = Math.abs(destPos.x - origPos.x);
        gapY = Math.abs(destPos.y - origPos.y);

        if (gapX === 0) {
            if (destPos.y > origPos.y) {
                origPos.y += this._origShape.getHeight() / 2;
                destPos.y -= this._destShape.getHeight() / 2;
            } else {
                origPos.y -= this._origShape.getHeight() / 2;
                destPos.y += this._destShape.getHeight() / 2;
            }

            gapY = Math.abs(destPos.y - origPos.y) / 3;

            points = [
                {
                    x: origPos.x,
                    y: origPos.y
                },
                {
                    x: origPos.x,
                    y: origPos.y + (gapY * (destPos.y > origPos.y ? 1 : -1))
                },
                {
                    x: origPos.x,
                    y: origPos.y + (gapY * (destPos.y > origPos.y ? 2 : -2))
                },
                {
                    x: destPos.x,
                    y: destPos.y
                }
            ];

        } else if (gapY === 0) {
            if (destPos.x > origPos.x) {
                origPos.x += this._origShape.getWidth() / 2;
                destPos.x -= this._destShape.getWidth() / 2;
            } else {
                origPos.x -= this._origShape.getWidth() / 2;
                destPos.x += this._destShape.getWidth() / 2;
            }

            gapX = Math.abs(destPos.x - origPos.x) / 3;

            points = [
                {
                    x: origPos.x,
                    y: origPos.y
                },
                {
                    x: origPos.x + (gapX * (destPos.x > origPos.x ? 1 : -1)),
                    y: origPos.y
                },
                {
                    x: origPos.x + (gapX * (destPos.x > origPos.x ? 2 : -2)),
                    y: origPos.y
                },
                {
                    x: destPos.x,
                    y: destPos.y
                }
            ];
        } else {
            if (gapY > gapX) {
                if (destPos.y > origPos.y) {
                    origPos.y += this._origShape.getHeight() / 2;
                    destPos.y -= this._destShape.getHeight() / 2;
                } else {
                    origPos.y -= this._origShape.getHeight() / 2;
                    destPos.y += this._destShape.getHeight() / 2;
                }

                gapY = Math.abs(destPos.y - origPos.y);

                gapY /= 2;
                points = [
                    {
                        x: origPos.x,
                        y: origPos.y
                    },
                    {
                        x: origPos.x,
                        y: origPos.y + (gapY * (destPos.y > origPos.y ? 1 : -1))
                    },
                    {
                        x: destPos.x,
                        y: origPos.y + (gapY * (destPos.y > origPos.y ? 1 : -1))
                    },
                    {
                        x: destPos.x,
                        y: destPos.y
                    }
                ];
            } else {
                if (destPos.x > origPos.x) {
                    origPos.x += this._origShape.getWidth() / 2;
                    destPos.x -= this._destShape.getWidth() / 2;
                } else {
                    origPos.x -= this._origShape.getWidth() / 2;
                    destPos.x += this._destShape.getWidth() / 2;
                }

                gapX = Math.abs(destPos.x - origPos.x);

                gapX /= 2;
                points = [
                    {
                        x: origPos.x,
                        y: origPos.y
                    },
                    {
                        x: origPos.x + (gapX * (destPos.x > origPos.x ? 1 : -1)),
                        y: origPos.y
                    },
                    {
                        x: origPos.x + (gapX * (destPos.x > origPos.x ? 1 : -1)),
                        y: destPos.y
                    },
                    {
                        x: destPos.x,
                        y: destPos.y
                    }
                ];
            }
        }

        paths = this._dom.paths || [];

        for (var i = 0; i < points.length - 1; i += 1) {
            path = paths[i] || SVGFactory.create('line');
            path.setAttribute("x1", points[i].x);
            path.setAttribute("y1", points[i].y);
            path.setAttribute("x2", points[i + 1].x);
            path.setAttribute("y2", points[i + 1].y);
            path.setAttribute("stroke", "black");

            this._html.appendChild(path);
            paths[i] = paths[i] || path;
        }

        this._dom.paths = paths;
        this._dom.arrow.setAttribute("transform", `translate(${points[i].x}, ${points[i].y})`);
        if (points[i-1].x === points[i].x) {
            this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${points[i].y > points[i-1].y ? 270 : 90})`);
        } else {
            this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${points[i].x > points[i-1].x ? 180 : 0})`);
        }
        this._html.appendChild(this._dom.arrow);
        this._points = points;

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
        arrow.setAttribute("d", "M 26 -13 L 0 0 L 26 13 z");

        arrowWrapper2.appendChild(arrow);
        arrowWrapper.appendChild(arrowWrapper2);
        this._dom.arrow = arrowWrapper;
        this._dom.arrowRotateContainer = arrowWrapper2;

        this._html = wrapper;
        return this._connect();
    }
}