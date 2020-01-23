import Port from './Port';
import Geometry from '../utils/Geometry';

const getSegmentOrientation = function (segment) {
  if (segment[0].x === segment[1].x) {
    return Port.ORIENTATION.Y;
  } if (segment[0].y === segment[1].y) {
    return Port.ORIENTATION.X;
  }
  throw new Error('getSegmentOrientation(): segment is diagonal.');
};

const normalizeSegment = function (segment) {
  const x = [Math.min(segment[0].x, segment[1].x), Math.max(segment[0].x, segment[1].x)];
  const y = [Math.min(segment[0].y, segment[1].y), Math.max(segment[0].y, segment[1].y)];

  return [
    {
      x: x[0],
      y: y[0],
    }, {
      x: x[1],
      y: y[1],
    },
  ];
};
// TODO: move to utils/move to Geometry.js
const getIntersectedPoints = function (connectionA, connectionB) {
  if (connectionA !== connectionB) {
    const segmentsA = connectionA.getSegments();
    const segmentsB = connectionB.getSegments();
    const intersectionPoints = [];

    segmentsA.forEach((segmentA, index) => {
      const orientationA = getSegmentOrientation(segmentA);
      const points = [];

      segmentA = normalizeSegment(segmentA);

      segmentsB.forEach((segmentB) => {
        const orientationB = getSegmentOrientation(segmentB);

        segmentB = normalizeSegment(segmentB);

        if (orientationA !== orientationB) {
          let point;

          // TODO: move to a util function
          if (orientationA === Port.ORIENTATION.X && segmentA[0].y > segmentB[0].y && segmentA[0].y < segmentB[1].y && segmentB[0].x > segmentA[0].x && segmentB[0].x < segmentA[1].x) {
            point = {
              x: segmentB[0].x,
              y: segmentA[0].y,
            };
          } else if (orientationA === Port.ORIENTATION.Y && segmentA[0].x > segmentB[0].x && segmentA[0].x < segmentB[1].x && segmentB[0].y > segmentA[0].y && segmentB[0].y < segmentA[1].y) {
            point = {
              x: segmentA[0].x,
              y: segmentB[0].y,
            };
          }

          if (point) {
            points.push(point);
          }
        }
      });

      intersectionPoints[index] = points;
    });

    return intersectionPoints;
  }

  return [];
};

export default {
  getIntersectionPoints(connection) {
    const connectionExtremePoints = connection.getBBoxExtremePoints();
    const canvas = connection.getCanvas();
    const otherConnections = (canvas && canvas.getConnections()) || [];
    const segments = [];

    otherConnections.forEach((otherConnection) => {
      let extremePoints;

      if (otherConnection !== connection) {
        extremePoints = otherConnection.getBBoxExtremePoints();

        if (Geometry.isRectOverlapped(connectionExtremePoints, extremePoints)) {
          const segmentIntersectionPoints = getIntersectedPoints(connection, otherConnection);

          segmentIntersectionPoints.forEach((points, index) => {
            if (points) {
              const intersectionPoints = points.map(point => ({
                connection: otherConnection,
                point,
              }));
  
              segments[index] = segments[index] || [];
              segments[index].push(...intersectionPoints);
            }
          });
        }
      }
    });

    return segments;
  },
};
