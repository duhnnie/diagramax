import Geometry from '../../utils/Geometry';
import { ORIENTATION as PORT_ORIENTATION } from '../Port';
import Connection from '../Connection';

/**
 * @private
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
 * @private
 * Returns the next descriptor based on a previous one.
 * @param {Object} descriptor The descriptor the next one will be calculated from.
 * @param {Object} normalizedPos The normalized position.
 * @param {Number} directionFactor The direction factor.
 * @returns {Object} An object that represents a point descriptor.
 */
function getNextDescriptor(descriptor, normalizedPos, directionFactor) {
  const { direction } = descriptor;
  // TODO: ARROW_SEGMENT_LENGTH should be defined in another place
  const point = getNextPoint(descriptor, Connection.ARROW_SEGMENT_LENGTH * direction);

  return {
    point,
    orientation: descriptor.orientation === PORT_ORIENTATION.X
      ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X,
    direction: ((descriptor.orientation === PORT_ORIENTATION.X
      ? normalizedPos.y : normalizedPos.x) * directionFactor) || 1,
  };
}

/**
 * Returns an array of intermediate points from an origin an a destiny point.
 * @param {Object} orig The origin descriptor.
 * @param {Object} dest The destiny descriptor.
 * @returns {Array}
 */
const RectWaypointStrategy = function RectWaypointStrategy(orig, dest) {
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
      return [point].concat(RectWaypointStrategy(newTarget, dest));
    }

    return RectWaypointStrategy(orig, newTarget).concat(point);
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
};

export default RectWaypointStrategy;
