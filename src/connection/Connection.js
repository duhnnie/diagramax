import Element from '../core/Element';
import Component from '../component/Component';
import BPMNShape from '../shape/Shape';
import ConnectionManager from './ConnectionManager';
import Port from './Port';
import ConnectionIntersectionResolver from './ConnectionIntersectionResolver';
import Geometry from '../utils/Geometry';
import { EVENT as DRAG_EVENT } from '../behavior/DragNDropBehavior';

const DEFAULTS = {
  origShape: null,
  destShape: null,
};

const INTERSECTION_SIZE = Object.freeze({
  WIDTH: 10,
  HEIGHT: 8,
});

const toPointForX = function (mainValue, secondaryValue) {
  return Geometry.toPoint(mainValue, secondaryValue);
};

const toPointForY = function (mainValue, secondaryValue) {
  return Geometry.toPoint(secondaryValue, mainValue);
};

class Connection extends Component {
  static get ARROW_SEGMENT_LENGTH() {
    return 20;
  }

  static get INTERSECTION_SIZE() {
    return INTERSECTION_SIZE;
  }

  static _getSegmentOrientation(from, to) {
    let orientation;

    if (from.x === to.x) {
      orientation = Port.ORIENTATION.Y;
    } else {
      orientation = (from.y === to.y ? Port.ORIENTATION.X : -1);
    }

    if (orientation === -1) {
      throw new Error('_getSegmentOrientation(): diagonal segment!');
    }

    return orientation;
  }

  static isValid(origShape, destShape) {
    return origShape !== destShape;
  }

  static _getSegmentDirection(from, to) {
    if (from.x < to.x || from.y < to.y) {
      return 1;
    }

    return from.x > to.x || from.y > to.y ? -1 : 0;
  }

  static getSegmentDrawing(from, to, intersections = []) {
    let segmentString = '';

    if (intersections.length) {
      const segmentOrientation = Connection._getSegmentOrientation(from, to);
      const segmentDirection = Connection._getSegmentDirection(from, to);
      const pathPieces = [];
      let lastPoint = null;

      if (segmentOrientation === Port.ORIENTATION.X) {
        intersections.sort(({ point: a }, { point: b }) => (a.x < b.x ? -1 : 1) * segmentDirection);
      } else {
        intersections.sort(({ point: a }, { point: b }) => (a.y < b.y ? -1 : 1) * segmentDirection);
      }

      intersections.forEach(({ point: intersection }) => {
        const halfArcWidth = Connection.INTERSECTION_SIZE.WIDTH * segmentDirection * -0.5;
        let toPoint;
        let axis;
        let crossAxis;

        if (segmentOrientation === Port.ORIENTATION.X) {
          axis = 'x';
          crossAxis = 'y';
          toPoint = toPointForX;
        } else {
          axis = 'y';
          crossAxis = 'x';
          toPoint = toPointForY;
        }

        let initial = intersection[axis] + halfArcWidth;
        const final = Geometry.clamp(intersection[axis] - halfArcWidth, to[axis]);

        if (lastPoint && ((segmentDirection === 1 && initial < lastPoint[axis])
          || (segmentDirection === -1 && initial > lastPoint[axis]))) {
          const targetPiece = pathPieces.pop();
          let last = lastPoint[axis];

          last = Geometry.clamp(final, lastPoint[axis], to[axis]);
          lastPoint = toPoint(final, intersection[crossAxis]);

          targetPiece.pop();
          targetPiece.pop();
          targetPiece.push(toPoint(last,
            intersection[crossAxis] + Connection.INTERSECTION_SIZE.HEIGHT));
          targetPiece.push(lastPoint);

          pathPieces.push(targetPiece);
        } else {
          initial = Geometry.clamp(initial, from[axis], to[axis]);

          const intersectionPoints = [
            toPoint(initial, intersection[crossAxis]),
            toPoint(initial, intersection[crossAxis] + Connection.INTERSECTION_SIZE.HEIGHT),
            toPoint(final, intersection[crossAxis] + Connection.INTERSECTION_SIZE.HEIGHT),
            toPoint(final, intersection[crossAxis]),
          ];

          pathPieces.push(intersectionPoints);
          lastPoint = _.last(intersectionPoints);
        }
      });

      segmentString = pathPieces.map((piece) => piece.map((point, index) => {
        const { x, y } = point;

        if (index === 0) {
          return `L${x} ${y}`;
        }
        if (index === 1) {
          return ` C${x} ${y}`;
        }

        return `, ${x} ${y}`;
      }).join('')).join(' ');
    }

    segmentString += ` L${to.x} ${to.y}`;

    return segmentString;
  }

  constructor(settings) {
    super(settings);
    this._points = [];
    this._origShape = null;
    this._destShape = null;
    this._interceptors = new Set();
    this._intersections = new Map();

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this
      .setCanvas(settings.canvas)
      .setOrigShape(settings.origShape)
      .setDestShape(settings.destShape)
  }

  addInterceptor(connection) {
    this._interceptors.add(connection);
  }

  setCanvas(...params) {
    if (this._intersections) {
      return super.setCanvas(...params);
    }

    return this;
  }

  /**
   * Add a new intersection point.
   * @param {Number} segmentIndex The index of the segment the intersection will be draw over.
   * @param {Connection} connection The connection that the intersection crosses.
   * @param {Point} point The intersection point.
   */
  addIntersection(segmentIndex, connection, point) {
    let segmentIntersections = this._intersections.get(segmentIndex);

    if (!segmentIntersections) {
      segmentIntersections = [];

      this._intersections.set(segmentIndex, segmentIntersections);
    }

    segmentIntersections.push({
      connection,
      point,
    });
  }

  /**
   * Determines if a intersection point already exists in any of the segments of a Connection.
   * @param {Point} point The point to find
   * @returns {Boolean}
   */
  hasIntersectionPoint(x, y) {
    const iterator = this._intersections.entries();
    let current = iterator.next();

    while (!current.done) {
      const [, points] = current.value;
      const found = points.find(({ point }) => x === point.x && y === point.y);

      if (found) {
        return true;
      }

      current = iterator.next();
    }

    return false;
  }

  _updateIntersectionPoints() {
    const intersectionsArray = ConnectionIntersectionResolver.getIntersectionPoints(this);

    this._removeIntersections();

    intersectionsArray.forEach((intersections, index) => {
      if (intersections) {
        intersections.forEach((intersection) => {
          intersection.connection.addInterceptor(this);
        });

        this._intersections.set(index, intersections);
      }
    });
  }

  _removeIntersections(connection = null) {
    if (connection) {
      this._intersections.forEach((intersections, key) => {
        this._intersections.set(key,
          intersections.filter((intersection) => intersection.connection !== connection));
      });

      this._draw();
    } else {
      this._intersections.clear();
    }
  }

  _onShapeDragStart() {
    this._html.setAttribute('opacity', 0.3);

    this._interceptors.forEach((connection) => connection._removeIntersections(this));

    this._removeIntersections();
  }

  _onShapeDragEnd() {
    this._html.setAttribute('opacity', 1);
    this.connect();
  }

  _addDragListeners(shape) {
    this._canvas.addEventListener(DRAG_EVENT.START, shape, this._onShapeDragStart, this);
    this._canvas.addEventListener(DRAG_EVENT.END, shape, this._onShapeDragEnd, this);

    return this;
  }

  _removeDragListeners(shape) {
    this._canvas.removeEventListener(DRAG_EVENT.START, shape, this._onShapeDragStart,
      this);
    this._canvas.removeEventListener(DRAG_EVENT.END, shape, this._onShapeDragEnd,
      this);

    return this;
  }

  setOrigShape(shape) {
    if (!(shape instanceof BPMNShape)) {
      throw new Error('setOrigShape(): invalid parameter.');
    } else if (!Connection.isValid(shape, this._destShape)) {
      throw new Error('setOrigShape(): The origin and destiny are the same.');
    }

    if (shape !== this._origShape) {
      if (this._origShape) {
        const oldOrigShape = this._origShape;

        this._origShape = null;
        oldOrigShape.removeConnection(this);
        this._removeDragListeners(oldOrigShape);
      }

      this._origShape = shape;
      shape.addOutgoingConnection(this);
      this._addDragListeners(shape);

      if (this._html) {
        this.connect();
      }
    }

    return this;
  }

  getOrigShape() {
    return this._origShape;
  }

  setDestShape(shape) {
    if (!(shape instanceof BPMNShape)) {
      throw new Error('setOrigShape(): invalid parameter.');
    } else if (!Connection.isValid(this._origShape, shape)) {
      throw new Error('setDestShape(): The origin and destiny are the same.');
    }

    if (shape !== this._destShape) {
      if (this._destShape) {
        const oldDestShape = this._destShape;

        this._destShape = null;
        oldDestShape.removeConnection(this);
        this._removeDragListeners(oldDestShape);
      }

      this._destShape = shape;
      shape.addIncomingConnection(this);
      this._addDragListeners(shape);

      if (this._html) {
        this.connect();
      }
    }

    return this;
  }

  getDestShape() {
    return this._destShape;
  }

  getBounds() {
    return this._points.reduce((bounds, { x, y }) => {
      if (_.isEmpty(bounds)) {
        return {
          top: y,
          right: x,
          bottom: y,
          left: x,
        };
      }

      bounds.top = y < bounds.top ? y : bounds.top;
      bounds.right = x > bounds.right ? x : bounds.right;
      bounds.bottom = y > bounds.bottom ? y : bounds.bottom;
      bounds.left = x < bounds.left ? x : bounds.left;

      return bounds;
    }, {});
  }

  getSegments() {
    const segments = [];

    for (let i = 1; i < this._points.length; i += 1) {
      segments.push([
        {
          x: this._points[i - 1].x,
          y: this._points[i - 1].y,
        },
        {
          x: this._points[i].x,
          y: this._points[i].y,
        },
      ]);
    }

    return segments;
  }

  disconnect() {
    return this.removeFromCanvas();
  }

  isConnectedWith(shape) {
    return this._origShape === shape || this._destShape === shape;
  }

  _draw() {
    const pointsLength = this._points.length;
    let pathString = '';

    if (pointsLength > 0) {
      const { _points: points } = this;
      const lastSegmentOrientation = Connection._getSegmentOrientation(points[pointsLength - 2],
        points[pointsLength - 1]);
      const lastSegmentDirection = Connection._getSegmentDirection(points[pointsLength - 2],
        points[pointsLength - 1]);
      const arrowAngle = (lastSegmentOrientation === Port.ORIENTATION.X
        ? 2 + lastSegmentDirection
        : 1 + (lastSegmentDirection * -1));

      pathString += `M${points[0].x} ${points[0].y}`;

      for (let i = 1; i < pointsLength; i += 1) {
        const pathIntersections = this._intersections.get(i - 1);

        pathString += Connection.getSegmentDrawing(
          points[i - 1], points[i],
          pathIntersections && pathIntersections.slice(0),
        );
      }

      this._dom.arrow.setAttribute('transform', `translate(${points[points.length - 1].x}, ${points[points.length - 1].y})`);
      this._dom.arrowRotateContainer.setAttribute('transform', `scale(0.5, 0.5) rotate(${90 * arrowAngle})`);
    }

    this._dom.arrow.style.display = pathString ? '' : 'none';
    this._dom.path.setAttribute('d', pathString);
    this._html.appendChild(this._dom.arrow);

    return this;
  }

  _calculatePoints() {
    if (!this._origShape || !this._destShape) return this;

    const portIndexes = ConnectionManager.getConnectionPorts(this._origShape, this._destShape);
    const origPortDescriptor = this._origShape.getPortDescriptor(portIndexes.orig);
    const destPortDescriptor = this._destShape.getPortDescriptor(portIndexes.dest);

    if (origPortDescriptor) {
      this._origShape.assignConnectionToPort(this, origPortDescriptor.portIndex);
      this._destShape.assignConnectionToPort(this, destPortDescriptor.portIndex);

      const waypoints = ConnectionManager.getWaypoints(origPortDescriptor, destPortDescriptor);

      waypoints.push({
        x: destPortDescriptor.point.x,
        y: destPortDescriptor.point.y,
      });

      waypoints.unshift({
        x: origPortDescriptor.point.x,
        y: origPortDescriptor.point.y,
      });

      this._points = waypoints || [];
    }

    return this;
  }

  connect() {
    if (!this._points.length) {
      this._calculatePoints();
      this._updateIntersectionPoints();
    } else if (this._origShape.isBeingDragged() || this._destShape.isBeingDragged()) {
      this._calculatePoints();
    } else {
      this._updateIntersectionPoints();
    }

    return this._draw();
  }

  removeFromCanvas() {
    const oldCanvas = this._canvas;
    const origShape = this._origShape;
    const destShape = this._destShape;

    if (oldCanvas) {
      if (origShape.getOutgoingConnections().has(this)) {
        this._origShape = null;
        origShape.removeConnection(this);
        this._removeDragListeners(origShape);
      }

      if (destShape.getIncomingConnections().has(this)) {
        this._destShape = null;
        destShape.removeConnection(this);
        this._removeDragListeners(destShape);
      }

      super.removeFromCanvas();
    }

    return this;
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    const arrowWrapper = Element.createSVG('g');
    const arrowWrapper2 = Element.createSVG('g');
    const arrow = Element.createSVG('path');
    const path = Element.createSVG('path');

    super._createHTML();
    this._html.setAttribute('class', 'connection');

    arrowWrapper2.setAttribute('transform', 'scale(0.5,0.5) rotate(-180)');
    arrow.setAttribute('end', 'target');
    arrow.setAttribute('d', 'M 0 0 L -13 -26 L 13 -26 z');

    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'black');

    arrowWrapper2.appendChild(arrow);
    arrowWrapper.appendChild(arrowWrapper2);
    this._html.appendChild(path);
    this._dom.path = path;
    this._dom.arrow = arrowWrapper;
    this._dom.arrowRotateContainer = arrowWrapper2;

    return this;
  }
}

export default Connection;
