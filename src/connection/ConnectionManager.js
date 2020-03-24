import Geometry from '../utils/Geometry';
import Port, { ORIENTATION as PORT_ORIENTATION, MODE as PORT_MODE } from './Port';
import Connection from './Connection';

/**
 * Returns and array with the port indexes sorted in priority order for elegibility based on a
 * primary orientation.
 * @param {Number} mainOrientation The orientation index that will be the assumed as the
 * prioritized one.
 * @param {Number} relativeX The relative position of origin respects destination in x axis.
 * @param {Number} relativeY The relative position of origin respects destination in y axis.
 * @returns {Array}
 */
function getPortPriorityOrder(mainOrientation, relativeX, relativeY) {
  const crossOrientation = mainOrientation === PORT_ORIENTATION.X
    ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X;
  const mainPorts = Port.getPriority(mainOrientation, mainOrientation === PORT_ORIENTATION.X
    ? relativeX : relativeY);
  const crossPorts = Port.getPriority(crossOrientation, crossOrientation === PORT_ORIENTATION.X
    ? relativeX : relativeY);

  mainPorts.splice(1, 0, ...crossPorts);

  return mainPorts;
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
  const origPosition = origShape.getPosition();
  const destPosition = destShape.getPosition();
  const { x: overlapX, y: overlapY } = Geometry.getOverlappedDimensions(origBounds, destBounds);
  const { x: relativeX, y: relativeY } = Geometry.getNormalizedPosition(origPosition, destPosition);
  let origPorts;
  let destPorts;

  if (overlapX === overlapY) {
    if (overlapX) {
      origPorts = getPortPriorityOrder(PORT_ORIENTATION.X, relativeX, relativeY);
      destPorts = origPorts.slice(0).reverse();
    } else {
      origPorts = getPortPriorityOrder(PORT_ORIENTATION.Y, relativeX, relativeY);
      destPorts = getPortPriorityOrder(PORT_ORIENTATION.X, relativeX * -1, relativeY * -1);
    }
  } else {
    let orientation;

    if (relativeX === 0) {
      orientation = PORT_ORIENTATION.Y;
    } else if (relativeY === 0) {
      orientation = PORT_ORIENTATION.X;
    } else {
      orientation = overlapX ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X;
    }

    origPorts = getPortPriorityOrder(orientation, relativeX, relativeY);
    destPorts = getPortPriorityOrder(orientation, relativeX * -1, relativeY * -1);
  }

  return {
    orig: origPorts,
    dest: destPorts,
  };
}

/**
 * Return the next point based on the a point description and a distance.
 * @param {Object} descriptor Point description.
 * @param {Number} distance Amount of units to move the point.
 * @returns {Point} A point.
 */
function getNextPoint(descriptor, distance) {
  const { x, y } = descriptor.point;
  const { orientation } = descriptor;

  return {
    x: x + (orientation === PORT_ORIENTATION.X ? distance : 0),
    y: y + (orientation === PORT_ORIENTATION.Y ? distance : 0),
  };
}

/**
 * Returns the next descriptor based on a previous one.
 * @param {Object} descriptor The descriptor the next one will be calculated from.
 * @param {Object} normalizedPos The normalized position.
 * @param {Number} directionFactor The direction factor.
 * @returns {Object} An object that represents a point descriptor.
 */
function getNextDescriptor(descriptor, normalizedPos, directionFactor) {
  const { direction } = descriptor;
  const point = getNextPoint(descriptor, Connection.ARROW_SEGMENT_LENGTH * direction);

  return {
    point,
    orientation: descriptor.orientation === PORT_ORIENTATION.X
      ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X,
    direction: ((descriptor.orientation === PORT_ORIENTATION.X
      ? normalizedPos.y : normalizedPos.x) * directionFactor) || 1,
  };
}

export default {
  /**
   * Returns an array of intermediate points from an origin an a destiny point.
   * @param {Object} orig The origin descriptor.
   * @param {Object} dest The destiny descriptor.
   * @returns {Array}
   */
  getWaypoints(orig, dest) {
    const normalizedPos = Geometry.getNormalizedPosition(orig.point, dest.point);
    let target;
    let directionFactor;

    // orig point direction is opposite to its destiny.
    if (orig.direction !== normalizedPos[orig.orientation]) {
      target = orig;
      directionFactor = 1;
    // dest point direction is opposite to its destiny
    } else if (dest.direction !== normalizedPos[dest.orientation] * -1) {
      target = dest;
      directionFactor = -1;
    }

    // if any of the point directions (orig or dest) is opposite respect each other
    if (target) {
      const newTarget = getNextDescriptor(target, normalizedPos, directionFactor);
      const { point } = newTarget;

      if (target === orig) {
        return [point].concat(this.getWaypoints(newTarget, dest));
      }

      return this.getWaypoints(orig, newTarget).concat(point);
    }

    // None of the points (orig and dest) direction is opposite respect the other one.
    if (orig.orientation !== dest.orientation) {
      return [{
        x: orig.orientation === PORT_ORIENTATION.X ? dest.point.x : orig.point.x,
        y: dest.orientation === PORT_ORIENTATION.X ? dest.point.y : orig.point.y,
      }];
    }

    // Both points have the same orientation (validated above) and they're at the same level
    if (orig.point.x === dest.point.x || orig.point.y === dest.point.y) {
      return [];
    }

    const diff = (dest.point[orig.orientation] - orig.point[orig.orientation]) / 2;

    return [
      getNextPoint(orig, diff),
      getNextPoint(dest, diff * -1),
    ];
  },
  /**
   * Returns the best-eligible ports for connect 2 shapes.
   * @param {Shape} origShape Origin shape.
   * @param {Shape} destShape Destination shape.
   * @returns {Object} An object with 'orig' and 'dest' keys and values with the port index.
   */
  getConnectionPorts(origShape, destShape) {
    const candidatePorts = getConnectionPriorityPorts(origShape, destShape);
    const orig = candidatePorts.orig.find((portIndex) => origShape.hasAvailablePortFor(portIndex, PORT_MODE.OUT));
    const dest = candidatePorts.dest.find((portIndex) => {
      if (origShape === destShape && portIndex === orig) return false;

      return destShape.hasAvailablePortFor(portIndex, PORT_MODE.IN);
    });

    return { orig, dest };
  },
};
