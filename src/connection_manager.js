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

    return {
        getShortestPathLength: function (pointA, pointB) {
            return Math.abs(pointA.y - pointB.y) + Math.abs(pointA.x - pointB.x);
        },
        getPortPriorityOrder: function (primaryOrientation, relativeX, relativeY) {
            let secondaryOrientation = primaryOrientation ? 0 : 1,
                ports;

            primaryOrientation = PRIORITY_PORTS[primaryOrientation][primaryOrientation ? relativeX : relativeY];
            secondaryOrientation = PRIORITY_PORTS[secondaryOrientation][secondaryOrientation ? relativeX :  relativeY];

            ports = [].concat(primaryOrientation);
            ports.splice(1, 0, ...secondaryOrientation);

            return ports;
        },
        getConnectionPriorityPorts: function (origShape, destShape) {
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

                    if (this.getShortestPathLength(origA, destA) < this.getShortestPathLength(origB, destB)) {
                        origPorts = this.getPortPriorityOrder(Port.ORIENTATION.VERTICAL, relativeX, relativeY);
                        destPorts = this.getPortPriorityOrder(Port.ORIENTATION.HORIZONTAL, relativeX * -1, relativeY * -1);
                    } else {
                        origPorts = this.getPortPriorityOrder(Port.ORIENTATION.HORIZONTAL, relativeX, relativeY);
                        destPorts = this.getPortPriorityOrder(Port.ORIENTATION.VERTICAL, relativeX * -1, relativeY * -1);
                    }
                }
            } else {
                origPorts = this.getPortPriorityOrder(intersectsX ? Port.ORIENTATION.VERTICAL : Port.ORIENTATION.HORIZONTAL, relativeX || 1, relativeY || 1);
                destPorts = this.getPortPriorityOrder(intersectsX ? Port.ORIENTATION.VERTICAL : Port.ORIENTATION.HORIZONTAL, (relativeX * -1) || -1, (relativeY * -1) || -1);
            }

            return {
                'orig': origPorts,
                'dest': destPorts
            };
        },
        getConnectionPorts: function (origShape, destShape) {
            var candidatePorts = this.getConnectionPriorityPorts(origShape, destShape),
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
