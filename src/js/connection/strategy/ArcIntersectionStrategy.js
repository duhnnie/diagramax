import Geometry from '../../utils/Geometry';
import Connection from '../Connection';
import { ORIENTATION } from '../Port';

const SIZE = 10;

const ArcIntersectionStrategy = function arcIntersectionStrategy (point, { from, to }, previousIntersection) {
  const segmentLength = Geometry.getPathLength(from, to);
  const segmentOrientation = Connection._getSegmentOrientation(from, to);
  const segmentDirection = Connection._getSegmentDirection(from, to);
  const halfSize = SIZE / 2;
  let replace = false;
  let intersectionPoint = point;
  let size = SIZE;

  if (segmentLength < size) {
    if (previousIntersection) {
      const previousSize = Geometry.getPathLength(previousIntersection.start, previousIntersection.end);

      size = previousSize + segmentLength;
      intersectionPoint = Geometry.getMiddlePoint(previousIntersection.start, to);
      replace = true;
    } else {
      size = segmentLength;
      intersectionPoint = Geometry.getMiddlePoint(from, to);
    }
  } else if (Geometry.getPathLength(from, point) < halfSize) {
    if (previousIntersection) {
      const end = Geometry.movePoint(point, halfSize * segmentDirection, segmentOrientation);

      size = Geometry.getPathLength(previousIntersection.start, end);
      intersectionPoint = Geometry.getMiddlePoint(previousIntersection.start, end);
      replace = true;
    } else {
      intersectionPoint = Geometry.movePoint(from, (halfSize) * segmentDirection, segmentOrientation);
    }
  } else if (Geometry.getPathLength(to, point) < halfSize) {
    intersectionPoint = Geometry.movePoint(to, (halfSize) * segmentDirection * -1, segmentOrientation);
  }

  if (size) {
    const normalizedSize = size * segmentDirection;
    const diff = normalizedSize;
    const distance = diff / 2;
    let { x: x1, y: y1 } = intersectionPoint;
    let { x: x2, y: y2 } = intersectionPoint;
    let xDiff = 0;
    let yDiff = 0;

    if (segmentOrientation === ORIENTATION.X) {
      x1 -= distance;
      x2 += distance;
      yDiff = normalizedSize;
    } else {
      // TODO: assuming that it's Y, won't work when supporting diagonal lines.
      y1 -= distance;
      y2 += distance;
      xDiff = normalizedSize;
    }

    return {
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      data: `c${xDiff} ${yDiff}, ${normalizedSize} ${normalizedSize}, ${yDiff} ${xDiff}`,
      replace,
    };
  }

  return null;
};

export default ArcIntersectionStrategy;
