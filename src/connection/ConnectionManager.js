import Geometry from '../utils/Geometry';
import Port from './Port';
import Connection from './Connection';

/**
 * Returns and array with the port indexes sorted in priority order for elegibility based on a 
 * primary orientation.
 * @param {Number} primaryOrientation The orientation index that will be the assumed as the 
 * prioritized one.
 * @param {Number} relativeX The relative position of origin respects destination in x axis.
 * @param {Number} relativeY The relative position of origin respects destination in y axis.
 * @returns {Array}
 */
function getPortPriorityOrder(primaryOrientation, relativeX, relativeY) {
  const secondaryOrientation = primaryOrientation === Port.ORIENTATION.HORIZONTAL
    ? Port.ORIENTATION.VERTICAL : Port.ORIENTATION.HORIZONTAL;
  const ports = Port.PRIORITY[primaryOrientation][primaryOrientation ? relativeX : relativeY];
  const secondaryPorts = Port.PRIORITY[secondaryOrientation][secondaryOrientation
    ? relativeX : relativeY];

  ports.splice(1, 0, ...secondaryPorts);

  return ports;
}

/**
 * Returns the ports in an array ordered by priority for each origin and destination shapes.
 * @param {Shape} origShape origin shape.
 * @param {Shape} destShape destination shape.
 * @returns {Object}
 */
function getConnectionPriorityPorts(origShape, destShape) {
  const origBounds = origShape.getBounds();
  const destBounds = destShape.getBounds();
  const { x: overlapX, y: overlapY } = Geometry.getOverlappedDimensions(origBounds, destBounds);
  const { x: relativeX, y: relativeY } = Geometry.getNormalizedRelativePos(origShape.getPosition(), destShape.getPosition());
  let origPorts;
  let destPorts;

  if (overlapX === overlapY) {
    if (overlapX) {
      origPorts = [];
      destPorts = [];
    } else {
      origPorts = getPortPriorityOrder(Port.ORIENTATION.VERTICAL, relativeX, relativeY);
      destPorts = getPortPriorityOrder(Port.ORIENTATION.HORIZONTAL, relativeX * -1, relativeY * -1);
    }
  } else {
    const orientation = overlapX ? Port.ORIENTATION.VERTICAL : Port.ORIENTATION.HORIZONTAL;

    origPorts = getPortPriorityOrder(orientation, relativeX, relativeY);
    destPorts = getPortPriorityOrder(orientation, relativeX * -1, relativeY * -1);
  }

  return {
    orig: origPorts,
    dest: destPorts,
  };
}

export default {
  getWaypoints(orig, dest) {
    const { x: relativeX, y: relativeY } = Geometry.getNormalizedRelativePos(orig.point, dest.point);
    const firstPoints = [];
    const lastPoints = [];

    if ((orig.orientation === Port.ORIENTATION.HORIZONTAL && orig.direction !== relativeX)
      || (orig.orientation === Port.ORIENTATION.VERTICAL && orig.direction !== relativeY)) {
      orig = {
        point: {
          x: orig.point.x + (orig.orientation ? Connection.ARROW_SEGMENT_LENGTH * orig.direction : 0),
          y: orig.point.y + (!orig.orientation ? Connection.ARROW_SEGMENT_LENGTH * orig.direction : 0),
        },
        orientation: orig.orientation ? 0 : 1,
        direction: (orig.orientation ? relativeY : relativeX) || 1,
      };

      firstPoints.push(orig.point);
    }

    if ((dest.orientation === Port.ORIENTATION.HORIZONTAL && dest.direction === relativeX)
      || (dest.orientation === Port.ORIENTATION.VERTICAL && dest.direction === relativeY)) {
      dest = {
        point: {
          x: dest.point.x + (dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0),
          y: dest.point.y + (!dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0),
        },
        orientation: dest.orientation ? 0 : 1,
        direction: ((dest.orientation ? relativeY : relativeX) * -1) || -1,
      };

      lastPoints.unshift(dest.point);
    }

    if (firstPoints.length || lastPoints.length) {
      return firstPoints.concat(this.getWaypoints(orig, dest), lastPoints);
    }

    if (orig.orientation === dest.orientation) {
      const { orientation } = orig;

      if ((orientation === Port.ORIENTATION.HORIZONTAL && orig.point.y === dest.point.y)
              || (orientation === Port.ORIENTATION.VERTICAL && orig.point.x === dest.point.x)) {
        // points are face 2 face
        return []; // There's no intermediate points.
      }
      let primaryGap = orientation ? Math.abs(dest.point.x - orig.point.x) : Math.abs(dest.point.y - orig.point.y);
      const secondaryGap = orientation ? Math.abs(dest.point.y - orig.point.y) : Math.abs(dest.point.x - orig.point.x);

      if (primaryGap / 2 < Connection.ARROW_SEGMENT_LENGTH && secondaryGap / 2 >= Connection.ARROW_SEGMENT_LENGTH) {
        orig = {
          point: {
            x: orig.point.x + (orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeX : 0),
            y: orig.point.y + (!orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeY : 0),
          },
          orientation: orig.orientation ? 0 : 1,
          direction: orientation ? relativeY : relativeX,
        };

        dest = {
          point: {
            x: dest.point.x + (orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeX * -1 : 0),
            y: dest.point.y + (!orientation ? Connection.ARROW_SEGMENT_LENGTH * relativeY * -1 : 0),
          },
          orientation: dest.orientation ? 0 : 1,
          direction: (orientation ? relativeY : relativeX) * -1,
        };

        return [orig.point].concat(this.getWaypoints(orig, dest), dest.point);
      }

      primaryGap /= 2;

      return [{
        x: orig.point.x + (orientation ? primaryGap * relativeX : 0),
        y: orig.point.y + (!orientation ? primaryGap * relativeY : 0),
      }, {
        x: dest.point.x + (orientation ? primaryGap * relativeX * -1 : 0),
        y: dest.point.y + (!orientation ? primaryGap * relativeY * -1 : 0),
      }];
    }
    const gapX = Math.abs(dest.point.x - orig.point.x);
    const gapY = Math.abs(dest.point.y - orig.point.y);

    if (gapX < Connection.ARROW_SEGMENT_LENGTH === gapY < Connection.ARROW_SEGMENT_LENGTH
      || ((dest.orientation === Port.ORIENTATION.HORIZONTAL && gapX >= Connection.ARROW_SEGMENT_LENGTH)
        || (dest.orientation === Port.ORIENTATION.VERTICAL && gapY >= Connection.ARROW_SEGMENT_LENGTH))) {
      return [{
        x: orig.orientation ? dest.point.x : orig.point.x,
        y: orig.orientation ? orig.point.y : dest.point.y,
      }];
    }
    dest = {
      point: {
        x: dest.point.x + (dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0),
        y: dest.point.y + (!dest.orientation ? Connection.ARROW_SEGMENT_LENGTH * dest.direction : 0),
      },
      orientation: dest.orientation ? 0 : 1,
      direction: (dest.orientation ? relativeY : relativeX) * -1,
    };

    return this.getWaypoints(orig, dest).concat(dest.point);
  },
  getConnectionPortIndexes(origShape, destShape) {
    const candidatePorts = getConnectionPriorityPorts(origShape, destShape);

    return {
      orig: candidatePorts.orig.find((portIndex) => origShape.hasAvailablePortFor(portIndex, Port.MODE.OUT)),
      dest: candidatePorts.dest.find((portIndex) => destShape.hasAvailablePortFor(portIndex, Port.MODE.IN)),
    };
  },
};
