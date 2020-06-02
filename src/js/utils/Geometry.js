import { ORIENTATION } from '../connection/Port';
import Connection from '../connection/Connection';

export default {
  // TODO: this will fail for diagonal lines.
  /**
   * Verifies if a point belongs to a line.
   * @param {Point} point The point subject of the evaluation.
   * @param {Point} pointA The point that defines one of the limits of the line.
   * @param {*} pointB The point that defines the other limit of the line.
   */
  isInLine(point, pointA, pointB) {
    const { x: xA, y: yA } = pointA;
    const { x: xB, y: yB } = pointB;
    const { x, y } = point;

    if (xA === xB && xA === x) {
      return this.isInBetween(y, yA, yB);
    }

    return (yA === yB && yA === y) ? this.isInBetween(x, xA, xB) : false;
  },
  // TODO: Change this method to something more generic, like, distance between two points and use
  // a generic formule in order to make it work with diagonal lines.
  // TODO: Rename to something like getPointDistance
  /**
   * Returns the length of the sortest path between to points.
   * @param {Point} pointA
   * @param {Point} pointB
   */
  getPathLength(pointA, pointB) {
    return Math.abs(pointA.y - pointB.y) + Math.abs(pointA.x - pointB.x);
  },
  // TODO: make this method to support digaonal directions.
  // TODO: move ORIENTATION, DIRECTION from Port to here
  /**
   * Will take the provided point and return a new point after applying a position displacement.
   * @param {Point} point The point to move.
   * @param {Number} units The units in which the point will be moved.
   * @param {Port.ORIENTATION} orientation The orientation in which the point will be moved.
   */
  movePoint(point, units, orientation) {
    let { x, y } = point;

    if (orientation === ORIENTATION.X) {
      x += units;
    } else if (orientation === ORIENTATION.Y) {
      y += units;
    }

    return { x, y };
  },
  // TODO: rename this method to something more meangful
  // TODO: There are some places in which this is required and it is implemented again,
  // modify those places to use this method.
  getRelativeFactor(a, b) {
    if (a < b) {
      return 1;
    }

    return a > b ? -1 : 0;
  },
  // TODO: Add support for diagonal lines.
  getMiddlePoint(pointA, pointB) {
    const length = this.getPathLength(pointA, pointB);
    const orientation = Connection._getSegmentOrientation(pointA, pointB);
    let { x, y } = pointA;

    if (orientation === ORIENTATION.X) {
      x += (length / 2) * this.getRelativeFactor(pointA.x, pointB.x);
    } else {
      // TODO: here we're assuming that is Y, but this will stop working when the line is diagonal.
      y += (length / 2) * this.getRelativeFactor(pointA.y, pointB.y);
    }

    return { x, y };
  },
  /**
   * Verifiy if a value is between two other values;
   * @param {Number} value The value to evaluate
   * @param {Number} limitA One of the limits.
   * @param {Number} limitB The other limit.
   * @returns {Boolean}
   */
  isInBetween(value, limitA, limitB) {
    const min = Math.min(limitA, limitB);
    const max = Math.max(limitA, limitB);

    return value > min && value < max;
  },
  /**
   * Returns and object specifying is the boundaries overlaps each other in any dimension
   * @param {Object} boundsA Object with data representing a boundary
   * @param {Object} boundsB Object with data representing a boundary
   * @returns {Object} And object with 'x' and 'y' keys, and a Boolean as value.
   * It indicates if the boundaries overlap each other in x and/or y.
   */
  getOverlappedDimensions(boundsA, boundsB) {
    let x = false;
    let y = false;

    if (boundsA.left === boundsB.left || boundsA.right === boundsB.right
      || this.isInBetween(boundsB.left, boundsA.left, boundsA.right)
      || this.isInBetween(boundsA.left, boundsB.left, boundsB.right)) {
      x = true;
    }

    if (boundsA.top === boundsB.top || boundsA.bottom === boundsB.bottom
      || this.isInBetween(boundsB.top, boundsA.top, boundsA.bottom)
      || this.isInBetween(boundsA.top, boundsB.top, boundsB.bottom)) {
      y = true;
    }

    return { x, y };
  },
  /**
   * Get the difference between two points.
   * @param {Point} origPoint Orig point.
   * @param {Point} destPoint Dest point.
   * @return {Point}
   */
  getDiff(origPoint, destPoint) {
    const x = destPoint.x - origPoint.x;
    const y = destPoint.y - origPoint.y;

    return { x, y };
  },
  /**
   * Returns an object that specifies the normalized relative position between an origin Shape
   * and a destination Shape.
   * If destination Shape is on the origin Shape's right side the relative position on x is 1.
   * If destination Shape is on the origin Shape's left side the relative position on x is -1.
   * If destination Shape is on the same x position than origin Shape,
   * then the relative postiion on x is 0.
   * If destination Shape is down the origin Shape the relative position on y is 1.
   * If destination Shape is up the origin Shape the relative position on y is -1.
   * If destination Shape is on the same y position than destination Shape,
   * then the relative position on y is 0.
   * @param {Point} originPoint Origin point
   * @param {Point} destinationPoint destination point
   * @return {Object} An object with 'x' and 'y' keys, whose values are the normalized
   * relative position for those axis.
   */
  getNormalizedPosition(origPoint, destPoint) {
    const { x, y } = this.getDiff(origPoint, destPoint);

    return {
      x: x ? x / Math.abs(x) : 0,
      y: y ? y / Math.abs(y) : 0,
    };
  },
  /**
   * Verifies if two planes (defined by a boundary object) are overlapped.
   * @param {Object} boundsA A boundary object.
   * @param {Object} boundsB A boundary object.
   * @returns {Boolean}
   */
  areOverlapped(boundsA, boundsB) {
    const { x, y } = this.getOverlappedDimensions(boundsA, boundsB);

    return x && y;
  },
  /**
   * Returns the position (x and y) and size (width and height) of a boundary object.
   * @param {Object} bound A boundary object.
   */
  getBoundSizeAndPos(bound) {
    const width = bound.right - bound.left;
    const height = bound.bottom - bound.top;

    return {
      x: bound.left + (width / 2),
      y: bound.top + (height / 2),
      width,
      height,
    };
  },
  /**
   * Returns value clamped to the inclusive range of min and max.
   * @param {*} value The value to be clamped
   * @param {*} limitA An inclusive border
   * @param {*} limitB An inclusive border
   */
  clamp(value, limitA, limitB) {
    const min = Math.min(limitA, limitB);
    const max = Math.max(limitA, limitB);

    if (value > max) {
      return max;
    }

    if (value < min) {
      return min;
    }

    return value;
  },
  /**
   * Creates an object with point structure.
   * @param {Number} x The x coordinate value.
   * @param {Number} y The y coordinate value.
   */
  toPoint(x, y) {
    return {
      x,
      y,
    };
  },
  /**
   * Compare if two points are the same.
   * @param {Point} pointA
   * @param {Point} pointB
   */
  areSamePoint(pointA, pointB) {
    return pointA.x === pointB.x && pointA.y === pointB.y;
  },
};
