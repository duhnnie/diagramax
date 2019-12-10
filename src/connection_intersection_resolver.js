var ConnectionIntersectionResolver = (function () {

    var getSegmentOrientation = function (segment) {
        if (segment[0].x === segment[1].x) {
            return Port.ORIENTATION.VERTICAL;
        } else if (segment[0].y === segment[1].y) {
            return Port.ORIENTATION.HORIZONTAL;
        } else {
            throw new Error("getSegmentOrientation(): segment is diagonal.");
        }
    };

    var normalizeSegment =  function (segment) {
        let x = [Math.min(segment[0].x, segment[1].x), Math.max(segment[0].x, segment[1].x)],
            y = [Math.min(segment[0].y, segment[1].y), Math.max(segment[0].y, segment[1].y)];

        return [
                {
                    x: x[0],
                    y: y[0]
                }, {
                    x: x[1],
                    y: y[1]
                }
            ];
    };

    var getIntersectedPoints = function (connectionA, connectionB) {
        if (connectionA !== connectionB) {
            let segmentsA = connectionA.getSegments(),
                segmentsB = connectionB.getSegments(),
                intersectionPoints = [];

            segmentsA.forEach((segmentA, index) => {
                segmentA = normalizeSegment(segmentA);

                 segmentsB.forEach(segmentB => {
                    let orientationA = getSegmentOrientation(segmentA),
                        orientationB = getSegmentOrientation(segmentB);

                    segmentB = normalizeSegment(segmentB);

                    if (orientationA !== orientationB) {
                        let point;

                        if (orientationA === Port.ORIENTATION.HORIZONTAL && segmentA[0].y > segmentB[0].y && segmentA[0].y < segmentB[1].y && segmentB[0].x > segmentA[0].x && segmentB[0].x < segmentA[1].x) {
                            point = {
                                x: segmentB[0].x,
                                y: segmentA[0].y
                            };
                        } else if (orientationA === Port.ORIENTATION.VERTICAL && segmentA[0].x > segmentB[0].x && segmentA[0].x < segmentB[1].x && segmentB[0].y > segmentA[0].y && segmentB[0].y < segmentA[1].y) {
                            point = {
                                x: segmentA[0].x,
                                y: segmentB[0].y
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
    }

    return {
        getIntersectionPoints(connection) {
            let connectionExtremePoints = connection.getBBoxExtremePoints(),
                minX = connectionExtremePoints.min.x,
                minY = connectionExtremePoints.min.y,
                maxX = connectionExtremePoints.max.x,
                maxY = connectionExtremePoints.max.y,
                posibleIntersectedConnections = [],
                canvas = connection.getCanvas(),
                otherConnections = (canvas && canvas.getConnections()) || [],
                segments = {};

            otherConnections.forEach(otherConnection => {
                let extremePoints;

                if (otherConnection !== connection) {
                    extremePoints = otherConnection.getBBoxExtremePoints();

                    if (((minX > extremePoints.min.x && minX < extremePoints.max.x) || (extremePoints.min.x > minX && extremePoints.min.x < maxX)) &&
                        ((minY > extremePoints.min.y && minY < extremePoints.max.y) || (extremePoints.min.y > minY && extremePoints.min.y < maxY))) {
                        let intersectedSegments = getIntersectedPoints(connection, otherConnection);

                        for (let i = 0; i < intersectedSegments.length; i += 1) {
                            let pointsInSegment =  intersectedSegments[i];

                            if (pointsInSegment) {
                                segments[i] = segments[i] || [];
                                segments[i].push(... pointsInSegment);
                            }
                        }
                    }
                }
            });

            return segments;
        }
    };
}());
