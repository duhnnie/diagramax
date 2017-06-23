var ConnectionManager = (function () {
    let PRIORITY_PORTS = {
        [Port.ORIENTATION.VERTICAL]: {
            '-1': [BPMNShape.PORT_INDEX.NORTH, BPMNShape.PORT_INDEX.SOUTH],
            '0': [BPMNShape.PORT_INDEX.SOUTH, BPMNShape.PORT_INDEX.NORTH],
            '1': [BPMNShape.PORT_INDEX.SOUTH, BPMNShape.PORT_INDEX.NORTH]
        },
        [Port.ORIENTATION.HORIZONTAL]: {
            '-1': [BPMNShape.PORT_INDEX.WEST, BPMNShape.PORT_INDEX.EAST],
            '0': [BPMNShape.PORT_INDEX.EAST, BPMNShape.PORT_INDEX.WEST],
            '1': [BPMNShape.PORT_INDEX.EAST, BPMNShape.PORT_INDEX.WEST]
        }
    };

    function getShortestPathLength(pointA, pointB) {
        return Math.abs(pointA.y - pointB.y) + Math.abs(pointA.x - pointB.x);
    };

    function getPortPriorityOrder(primaryOrientation, relativeX, relativeY) {
        let secondaryOrientation = primaryOrientation ? 0 : 1,
            ports;

        primaryOrientation = PRIORITY_PORTS[primaryOrientation][primaryOrientation ? relativeX : relativeY];
        secondaryOrientation = PRIORITY_PORTS[secondaryOrientation][secondaryOrientation ? relativeX :  relativeY];

        ports = [].concat(primaryOrientation);
        ports.splice(1, 0, ...secondaryOrientation);

        return ports;
    };

    function getConnectionPriorityPorts(origShape, destShape) {
        let origPorts,
            destPorts,
            origPos = origShape.getPosition(),
            destPos = destShape.getPosition(),
            origBounds = origShape.getBounds(),
            destBounds = destShape.getBounds(),
            relativeX = destPos.x - origPos.x,
            relativeY = destPos.y - origPos.y,
            intersectsX,
            intersectsY;

        relativeX = relativeX ? relativeX / Math.abs(relativeX) : 0;
        relativeY = relativeY ? relativeY / Math.abs(relativeY) : 0;

        intersectsX = (relativeX > 0 && origBounds.right - destBounds.left > 0)
            || (relativeX < 0 && destBounds.right - origBounds.left > 0)
            || relativeX === 0;
        intersectsY = (relativeY > 0 && origBounds.bottom - destBounds.top > 0)
            || (relativeY < 0 && destBounds.bottom - origBounds.top > 0)
            || relativeY ===0;

        if (intersectsX === intersectsY) {
            if (intersectsX) {
                origPorts = destPorts = [];
            } else {
                let origA = {
                        x: origPos.x,
                        y: relativeY > 0 ? origBounds.bottom : origBounds.top
                    },
                    destA = {
                        x: relativeX > 0 ? destBounds.west : destBounds.east,
                        y: destPos.y
                    },
                    origB = {
                        x: relativeX > 0 ? origBounds.east : origBounds.west,
                        y: origPos.y
                    },
                    destB = {
                        x: destPos.x,
                        y: relativeY > 0 ? destBounds.top : destBounds.bottom
                    };

                if (getShortestPathLength(origA, destA) < getShortestPathLength(origB, destB)) {
                    origPorts = getPortPriorityOrder(Port.ORIENTATION.VERTICAL, relativeX, relativeY);
                    destPorts = getPortPriorityOrder(Port.ORIENTATION.HORIZONTAL, relativeX * -1, relativeY * -1);
                } else {
                    origPorts = getPortPriorityOrder(Port.ORIENTATION.HORIZONTAL, relativeX, relativeY);
                    destPorts = getPortPriorityOrder(Port.ORIENTATION.VERTICAL, relativeX * -1, relativeY * -1);
                }
            }
        } else {
            origPorts = getPortPriorityOrder(intersectsX ? Port.ORIENTATION.VERTICAL : Port.ORIENTATION.HORIZONTAL, relativeX || 1, relativeY || 1);
            destPorts = getPortPriorityOrder(intersectsX ? Port.ORIENTATION.VERTICAL : Port.ORIENTATION.HORIZONTAL, (relativeX * -1) || -1, (relativeY * -1) || -1);
        }

        return {
            'orig': origPorts,
            'dest': destPorts
        };
    };

    return {
        getWaypoints: function (orig, dest) {
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
                return firstPoints.concat(this.getWaypoints(orig, dest), lastPoints);
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

                        return [orig.point].concat(this.getWaypoints(orig, dest), dest.point);
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

                    return this.getWaypoints(orig, dest).concat(dest.point);
                }
            }
        },
        getConnectionPorts: function (origShape, destShape) {
            var candidatePorts = getConnectionPriorityPorts(origShape, destShape),
                origPorts = origShape.getPorts(),
                destPorts = destShape.getPorts();

            candidatePorts.orig = candidatePorts.orig.find(i => origPorts[i].mode === Port.MODE.OUT || origPorts[i].mode === null);
            candidatePorts.dest = candidatePorts.dest.find(i => destPorts[i].mode === Port.MODE.IN || destPorts[i].mode === null);

            return {
                orig: origPorts[candidatePorts.orig],
                dest: destPorts[candidatePorts.dest]
            };
        }
    };
}());
