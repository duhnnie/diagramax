import Element from '../core/Element';
import Component from '../component/Component';
import { ORIENTATION as PORT_ORIENTATION, MODE as PORT_MODE, ORIENTATION } from './Port';
import ConnectionIntersectionResolver from './ConnectionIntersectionResolver';
import Geometry from '../utils/Geometry';
import { EVENT as DRAG_EVENT } from '../behavior/DraggableShapeBehavior';
import { EVENT as RESIZE_EVENT } from '../behavior/ResizeBehavior';
import SelectBehavior from '../behavior/SelectBehavior';
import PortPriorityStrategyRepository, { PRODUCTS as PORTPRIORITY_STRATEGY } from './PortPriorityStrategyRepository';
import WaypointStrategyRepository, { PRODUCTS as WAYPOINT_STRATEGY } from './WaypointStrategyRepository';
import LineStrategyRepository, { PRODUCTS as LINE_STRATEGY } from './LineStrategyRepository';
import VertexStrategyRepository, { PRODUCTS as VERTEX_STRATEGY } from './VertexStrategyRepository';
import IntersectionStrategyRepository, { PRODUCTS as INTERSECTION_STRATEGY } from './IntersectionStrategyRepository';
import ReconnectionBehavior from '../behavior/ReconnectionBehavior';

export const EVENT = Object.freeze({
  CONNECT: 'connect',
  PORT_CHANGE: 'portchange',
  DISCONNECT: 'disconnect',
});

const DEFAULTS = {
  origShape: null,
  destShape: null,
  portPriority: PORTPRIORITY_STRATEGY.CLOSER,
  waypoint: WAYPOINT_STRATEGY.RECT,
  line: LINE_STRATEGY.STRAIGHT,
  vertex: VERTEX_STRATEGY.ARC,
  vertexSize: 10,
  intersection: INTERSECTION_STRATEGY.ARC,
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

  // TODO: Move this to Geometry as getLineSlope.
  static _getSegmentOrientation(from, to) {
    let orientation;

    if (from.x === to.x) {
      orientation = PORT_ORIENTATION.Y;
    } else {
      orientation = (from.y === to.y ? PORT_ORIENTATION.X : -1);
    }

    if (orientation === -1) {
      throw new Error('_getSegmentOrientation(): diagonal segment!');
    }

    return orientation;
  }

  static _getSegmentDirection(from, to) {
    if (from.x < to.x || from.y < to.y) {
      return 1;
    }

    return from.x > to.x || from.y > to.y ? -1 : 0;
  }

  constructor(settings) {
    super(settings);

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this._points = [];
    this._origShape = null;
    this._destShape = null;
    this._origPort = null;
    this._destPort = null;
    this._interceptors = new Set();
    this._intersections = new Map();
    this._selectBehavior = new SelectBehavior(this);
    this._portPriorityStrategy = PortPriorityStrategyRepository.get(settings.portPriority);
    this._waypointStrategy = WaypointStrategyRepository.get(settings.waypoint);
    this._lineStrategy = LineStrategyRepository.get(settings.line);
    this._vertexStrategy = VertexStrategyRepository.get(settings.vertex);
    this._vertexSize = settings.vertexSize;
    this._intersectionStrategy = IntersectionStrategyRepository.get(settings.intersection);
    this._reconnectionBehavior = new ReconnectionBehavior(this);

    this
      // TODO: is this useful? anyway it's redundant
      .setCanvas(settings.canvas)
      .connect(settings.origShape, settings.destShape);
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

  _removeInterceptors() {
    this._interceptors.forEach((connection) => connection._removeIntersections(this));
    this._interceptors.clear();
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

    this._removeInterceptors();
    this._removeIntersections();
  }

  _onShapeDragEnd() {
    this._html.setAttribute('opacity', 1);
    this.make();
  }

  _addDragListeners(shape) {
    this._canvas.addEventListener(DRAG_EVENT.START, shape, this._onShapeDragStart, this);
    this._canvas.addEventListener(DRAG_EVENT.END, shape, this._onShapeDragEnd, this);
    this._canvas.addEventListener(RESIZE_EVENT.START, shape, this._onShapeDragStart, this);
    this._canvas.addEventListener(RESIZE_EVENT.END, shape, this._onShapeDragEnd, this);

    return this;
  }

  _removeDragListeners(shape) {
    this._canvas.removeEventListener(DRAG_EVENT.START, shape, this._onShapeDragStart,
      this);
    this._canvas.removeEventListener(DRAG_EVENT.END, shape, this._onShapeDragEnd,
      this);
    this._canvas.removeEventListener(RESIZE_EVENT.START, shape, this._onShapeDragEnd, this);
    this._canvas.removeEventListener(RESIZE_EVENT.END, shape, this._onShapeDragEnd, this);

    return this;
  }

  getOrigShape() {
    return this._origShape;
  }

  getDestShape() {
    return this._destShape;
  }

  getOrigPort() {
    return this._origPort;
  }

  getDestPort() {
    return this._destPort;
  }

  connect(origShape, destShape) {
    if (origShape.canAcceptConnection(destShape, PORT_MODE.OUT)
      && destShape.canAcceptConnection(origShape, PORT_MODE.IN)) {
      const { _origShape: oldOrigShape, _destShape: oldDestShape } = this;
      const changeOrigShape = origShape !== oldOrigShape;
      const changeDestShape = destShape !== oldDestShape;
      let result = true;

      this._origShape = origShape;
      this._destShape = destShape;

      if (changeOrigShape) {
        if (oldOrigShape) {
          oldOrigShape.removeConnection(this);
          this._removeDragListeners(oldOrigShape);
          this._points = [];
        }

        result = origShape.addOutgoingConnection(this);
        if (result) this._addDragListeners(origShape);
      }

      if (changeDestShape && result) {
        if (oldDestShape) {
          oldDestShape.removeConnection(this);
          this._removeDragListeners(oldDestShape);
          this._points = [];
        }

        result = destShape.addIncomingConnection(this);
        if (result) this._addDragListeners(destShape);
      }

      if (result) {
        if (changeOrigShape || changeDestShape) {
          this._canvas.dispatchEvent(EVENT.CONNECT, this, {
            origShape,
            destShape,
          });
        }
        this.make();
      } else {
        this.disconnect();
      }

      return result;
    }

    return false;
  }

  getBounds() {
    return this._points.reduce((bounds, { x, y }) => {
      if (!bounds) {
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
    }, null) || {};
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
    return this.remove();
  }

  isConnectedWith(shape) {
    return this._origShape === shape || this._destShape === shape;
  }

  _getVertexData(start, middle, end) {
    if (!(start && middle && end)) {
      return null;
    }

    // TODO: Make support for diagonal segments
    const beforeDirection = Connection._getSegmentDirection(start, middle);
    const beforeOrientation = Connection._getSegmentOrientation(start, middle);
    const beforeLength = Geometry.getPathLength(start, middle);
    const afterDirection = Connection._getSegmentDirection(middle, end);
    const afterOrientation = Connection._getSegmentOrientation(middle, end);
    const afterLength = Geometry.getPathLength(middle, end) / 2;
    const size = Math.min(this._vertexSize, beforeLength, afterLength);
    const beforeDisplacement = Geometry.movePoint(middle, size * beforeDirection * -1, beforeOrientation);
    const afterDisplacement = Geometry.movePoint(middle, size * afterDirection, afterOrientation);
    const vertexStart = {
      x: beforeOrientation === ORIENTATION.X ? beforeDisplacement.x : middle.x,
      y: beforeOrientation === ORIENTATION.Y ? beforeDisplacement.y : middle.y,
    };
    const vertexEnd = {
      x: afterOrientation === ORIENTATION.X ? afterDisplacement.x : middle.x,
      y: afterOrientation === ORIENTATION.Y ? afterDisplacement.y : middle.y,
    };

    return {
      data: this._vertexStrategy(vertexStart, middle, vertexEnd),
      start: vertexStart,
      middle,
      end: vertexEnd,
    };
  }

  _getSegmentData(start, end, intersections) {
    const segmentOrientation = Connection._getSegmentOrientation(start, end);
    const segmentDirection = Connection._getSegmentDirection(start, end);
    const to = end;
    let from = start;
    let lastIntersection;

    // TODO: Maybe this should be ordered at the moment of setting (or before)
    if (segmentOrientation === PORT_ORIENTATION.X) {
      intersections.sort(({ point: a }, { point: b }) => (a.x < b.x ? -1 : 1) * segmentDirection);
    } else {
      intersections.sort(({ point: a }, { point: b }) => (a.y < b.y ? -1 : 1) * segmentDirection);
    }

    return intersections.map(({ point }) => {
      const intersection = this._intersectionStrategy(point, { from, to }, lastIntersection);
      const data = [];

      if (intersection) {
        if (!intersection.replace && lastIntersection) {
          data.push(lastIntersection.data);
        }

        data.push(this._lineStrategy(from, intersection.start));
        from = intersection.end;
      }

      lastIntersection = intersection;
      return data.join(' ');
    })
      .concat((lastIntersection && lastIntersection.data) || '')
      .concat(this._lineStrategy(from, to)).join(' ');
  }

  _draw() {
    const points = this._points.slice(0);
    let vertex;

    const pathString = points.map((point, index, array) => {
      if (index === 0) {
        return `M${point.x} ${point.y}`;
      }

      const nextPoint = array[index + 1];
      const data = [];
      const start = (vertex && vertex.end) || array[index - 1];
      const intersections = (this._intersections.get(index - 1) || []).slice(0);

      if (nextPoint) {
        vertex = this._getVertexData(start, point, nextPoint);

        if (vertex) {
          data.push(this._getSegmentData(start, vertex.start, intersections));
          data.push(vertex.data);
        } else {
          data.push(this._getSegmentData(start, point, intersections));
        }
        return data.join(' ');
      }

      return this._getSegmentData(start, point, intersections);
    }).join(' ');

    if (pathString) {
      const pointsLength = points.length;

      const lastSegmentOrientation = Connection._getSegmentOrientation(points[pointsLength - 2],
        points[pointsLength - 1]);
      const lastSegmentDirection = Connection._getSegmentDirection(points[pointsLength - 2],
        points[pointsLength - 1]);
      const arrowAngle = (lastSegmentOrientation === PORT_ORIENTATION.X
        ? 2 + lastSegmentDirection
        : 1 + (lastSegmentDirection * -1));

      this._dom.arrow.setAttribute('transform', `translate(${points[points.length - 1].x}, ${points[points.length - 1].y})`);
      this._dom.arrowRotateContainer.setAttribute('transform', `scale(0.5, 0.5) rotate(${90 * arrowAngle})`);
    }

    this._dom.arrow.style.display = pathString ? '' : 'none';
    this._dom.path.setAttribute('d', pathString);
    this._html.appendChild(this._dom.arrow);

    return this;
  }

  /**
   * Returns the best-eligible ports for connect 2 shapes.
   * @returns {Object} An object with 'orig' and 'dest' keys and values with the port index.
   */
  _getPortsForConnection() {
    const { _origShape, _destShape } = this;
    const candidatePorts = this._portPriorityStrategy(_origShape, _destShape);
    const orig = candidatePorts.orig.find((portIndex) => _origShape.hasAvailablePortFor(portIndex, PORT_MODE.OUT));
    const dest = candidatePorts.dest.find((portIndex) => {
      if (_origShape === _destShape && portIndex === orig) return false;

      return _destShape.hasAvailablePortFor(portIndex, PORT_MODE.IN);
    });

    return { orig, dest };
  }

  _setPorts(origPort, destPort) {
    const { _origPort: oldOrigPort, _destPort: oldDestPort } = this;

    if (origPort !== oldOrigPort || destPort !== oldDestPort) {
      this._origPort = origPort;
      this._destPort = destPort;
      this._canvas.dispatchEvent(EVENT.PORT_CHANGE, this, {
        origPort,
        destPort,
        oldOrigPort,
        oldDestPort,
      });
    }
  }

  _calculatePoints() {
    if (!this._origShape || !this._destShape) return this;

    const portIndexes = this._getPortsForConnection();
    const origPort = this._origShape.getPort(portIndexes.orig);
    const destPort = this._destShape.getPort(portIndexes.dest);
    const origPortDescriptor = origPort.getDescription();
    const destPortDescriptor = destPort.getDescription();

    if (origPortDescriptor) {
      this._origShape.assignConnectionToPort(this, origPortDescriptor.portIndex, PORT_MODE.OUT);
      this._destShape.assignConnectionToPort(this, destPortDescriptor.portIndex, PORT_MODE.IN);

      const waypoints = this._waypointStrategy(origPortDescriptor, destPortDescriptor);

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

    this._setPorts(origPort, destPort);

    return this;
  }

  make() {
    if (!this._origShape || !this._destShape) return;

    if (!this._points.length) {
      this._calculatePoints();
      this._updateIntersectionPoints();
    } else if (this._origShape.isBeingDragged() || this._destShape.isBeingDragged()
      || this._origShape.isBeingResized() || this._destShape.isBeingResized()) {
      this._calculatePoints();
    } else {
      this._updateIntersectionPoints();
    }

    return this._draw();
  }

  remove() {
    const oldCanvas = this._canvas;
    const origShape = this._origShape;
    const destShape = this._destShape;

    if (oldCanvas) {
      if (origShape && origShape.getOutgoingConnections().has(this)) {
        this._origShape = null;
        origShape.removeConnection(this);
        this._removeDragListeners(origShape);
      }

      if (destShape && destShape.getIncomingConnections().has(this)) {
        this._destShape = null;
        destShape.removeConnection(this);
        this._removeDragListeners(destShape);
      }

      this._setPorts(null, null);
      this._removeInterceptors();
      oldCanvas.dispatchEvent(EVENT.DISCONNECT, this, {
        origShape,
        destShape,
      });
      super.remove();
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

    arrowWrapper2.setAttribute('transform', 'scale(0.5,0.5) rotate(-180)');
    arrow.setAttribute('end', 'target');
    arrow.setAttribute('d', 'M 0 0 L -13 -26 L 13 -26 z');

    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'black');

    arrowWrapper2.appendChild(arrow);
    arrowWrapper.appendChild(arrowWrapper2);
    this._dom.mainElement = path;

    super._createHTML();

    this._html.classList.add('connection');
    this._html.appendChild(path);
    this._dom.path = path;
    this._dom.arrow = arrowWrapper;
    this._dom.arrowRotateContainer = arrowWrapper2;
    this._selectBehavior.attachBehavior();
    this._reconnectionBehavior.attachBehavior();

    return this;
  }
}

export default Connection;
