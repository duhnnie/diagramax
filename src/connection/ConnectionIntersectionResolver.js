import Port from './Port';

const getSegmentOrientation = function (segment) {
  if (segment[0].x === segment[1].x) {
    return Port.ORIENTATION.VERTICAL;
  } if (segment[0].y === segment[1].y) {
    return Port.ORIENTATION.HORIZONTAL;
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

const getIntersectedPoints = function (connectionA, connectionB) {
  return [];
  if (connectionA !== connectionB) {
    const segmentsA = connectionA.getSegments();
    const segmentsB = connectionB.getSegments();
    const intersectionPoints = [];

    segmentsA.forEach((segmentA, index) => {
      segmentA = normalizeSegment(segmentA);

      segmentsB.forEach((segmentB) => {
        const orientationA = getSegmentOrientation(segmentA);
        const orientationB = getSegmentOrientation(segmentB);

        segmentB = normalizeSegment(segmentB);

        if (orientationA !== orientationB) {
          let point;

          if (orientationA === Port.ORIENTATION.HORIZONTAL && segmentA[0].y > segmentB[0].y && segmentA[0].y < segmentB[1].y && segmentB[0].x > segmentA[0].x && segmentB[0].x < segmentA[1].x) {
            point = {
              x: segmentB[0].x,
              y: segmentA[0].y,
            };
          } else if (orientationA === Port.ORIENTATION.VERTICAL && segmentA[0].x > segmentB[0].x && segmentA[0].x < segmentB[1].x && segmentB[0].y > segmentA[0].y && segmentB[0].y < segmentA[1].y) {
            point = {
              x: segmentA[0].x,
              y: segmentB[0].y,
            };
          }

          if (point) {
            intersectionPoints[index] = intersectionPoints[index] || [];
            intersectionPoints[index].push(point);
          }
        }
      });
    });

    return intersectionPoints;
  }
};

export default {
  getIntersectionPoints(connection) {
    const connectionExtremePoints = connection.getBBoxExtremePoints();
    const minX = connectionExtremePoints.min.x;
    const minY = connectionExtremePoints.min.y;
    const maxX = connectionExtremePoints.max.x;
    const maxY = connectionExtremePoints.max.y;
    const posibleIntersectedConnections = [];
    const canvas = connection.getCanvas();
    const otherConnections = (canvas && canvas.getConnections()) || [];
    const segments = {};

    otherConnections.forEach((otherConnection) => {
      let extremePoints;

      if (otherConnection !== connection) {
        extremePoints = otherConnection.getBBoxExtremePoints();

        if (((minX > extremePoints.min.x && minX < extremePoints.max.x) || (extremePoints.min.x > minX && extremePoints.min.x < maxX))
                && ((minY > extremePoints.min.y && minY < extremePoints.max.y) || (extremePoints.min.y > minY && extremePoints.min.y < maxY))) {
          const intersectedSegments = getIntersectedPoints(connection, otherConnection);

          for (let i = 0; i < intersectedSegments.length; i += 1) {
            const pointsInSegment = intersectedSegments[i];

            if (pointsInSegment) {
              segments[i] = segments[i] || [];
              segments[i].push(...pointsInSegment);
            }
          }
        }
      }
    });

    return segments;
  },
};
