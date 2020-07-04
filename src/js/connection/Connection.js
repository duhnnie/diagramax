import BaseElement from '../core/BaseElement';
import DiagramElement from '../core/DiagramElement';
import { ORIENTATION as PORT_ORIENTATION, MODE as PORT_MODE, ORIENTATION, MODE } from './Port';
import ConnectionIntersectionResolver from './ConnectionIntersectionResolver';
import Geometry from '../utils/Geometry';
import { EVENT as SHAPE_EVENT } from '../shape/Shape';
import { EVENT as RESIZE_EVENT } from '../behavior/ResizeBehavior';
import SelectBehavior from '../behavior/SelectBehavior';
import WaypointStrategyRepository, { PRODUCTS as WAYPOINT_STRATEGY } from './WaypointStrategyRepository';
import LineStrategyRepository, { PRODUCTS as LINE_STRATEGY } from './LineStrategyRepository';
import VertexStrategyRepository, { PRODUCTS as VERTEX_STRATEGY } from './VertexStrategyRepository';
import IntersectionStrategyRepository, { PRODUCTS as INTERSECTION_STRATEGY } from './IntersectionStrategyRepository';
import DraggableConnectionBehavior from '../behavior/DraggableConnectionBehavior';
import DiagramUI from '../core/DiagramUI';

export const EVENT = Object.freeze({
  CONNECT: 'connect',
  PORT_CHANGE: 'portchange',
  DISCONNECT: 'disconnect',
});

const DEFAULTS = {
  origShape: null,
  destShape: null,
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

class Connection extends DiagramElement {
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
    // TODO: Sibling class has also a _dragBehavior property, they could be lift up to parent class.
    this._dragBehavior = new DraggableConnectionBehavior(this);
    this._waypointStrategy = WaypointStrategyRepository.get(settings.waypoint);
    this._lineStrategy = LineStrategyRepository.get(settings.line);
    this._vertexStrategy = VertexStrategyRepository.get(settings.vertex);
    this._vertexSize = settings.vertexSize;
    this._intersectionStrategy = IntersectionStrategyRepository.get(settings.intersection);

    // TODO: is this useful? anyway it's redundant
    this.setCanvas(settings.canvas);

    if (settings.origShape && settings.destShape) {
      this.connect(settings.origShape, settings.destShape);
    }
  }

  _getComponentUI() {
    return new DiagramUI(this);
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
    // TODO: intersections and interceptors adding removal should be handled with events (DS-132)
    if (connection && this._origPort && this._destPort) {
      this._intersections.forEach((intersections, key) => {
        this._intersections.set(key,
          intersections.filter((intersection) => intersection.connection !== connection));
      });

      this._draw(this._origPort.getDescription(), this._destPort.getDescription());
    } else {
      this._intersections.clear();
    }
  }

  _onShapeDragStart() {
    // TODO: The opacity is being set by a css class in DraggableConnectionBehavior,
    // move this that place.
    this._html.setAttribute('opacity', 0.3);

    this._removeInterceptors();
    this._removeIntersections();
  }

  _onShapeDrag() {
    this.make();
  }

  _onShapeDragEnd() {
    this._html.setAttribute('opacity', 1);
    this.make();
  }

  _onShapePositionChange() {
    this.make();
  }

  _addDragListeners(shape) {
    this._canvas.addEventListener(SHAPE_EVENT.DRAG_START, shape, this._onShapeDragStart, this);
    this._canvas.addEventListener(SHAPE_EVENT.DRAG_END, shape, this._onShapeDragEnd, this);
    this._canvas.addEventListener(RESIZE_EVENT.START, shape, this._onShapeDragStart, this);
    this._canvas.addEventListener(RESIZE_EVENT.END, shape, this._onShapeDragEnd, this);

    return this;
  }

  _removeDragListeners(shape) {
    const { _canvas } = this;

    if (_canvas) {
      // TODO: here we have that some event are defined in Shape and other in resize behavior, maybe Drag events should
      // be defined in drag behavior, the same way the resize behaviors are in the ResizeBehavior
      this._canvas.removeEventListener(SHAPE_EVENT.DRAG_START, shape, this._onShapeDragStart,
        this);
      this._canvas.removeEventListener(SHAPE_EVENT.DRAG_END, shape, this._onShapeDragEnd,
        this);
      this._canvas.removeEventListener(RESIZE_EVENT.START, shape, this._onShapeDragStart, this);
      this._canvas.removeEventListener(RESIZE_EVENT.END, shape, this._onShapeDragEnd, this);
    }

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

  start(shape, direction) {
    this._dragBehavior.start(shape, direction);
  }

  end(shape) {
    this._dragBehavior.end();
  }

  // TODO: for robbustness we need to verify that connection, origShape and destShape
  // are in the same canvas IMPORTANT!
  connect(origShape, destShape) {
    if (origShape.canAcceptConnection(PORT_MODE.ORIG, destShape)
      && destShape.canAcceptConnection(PORT_MODE.DEST, origShape)
      // TODO: Fix access to protected members.
      // TODO: This is hot fix, this should be handled by proxied functions
      // a ticket for that was created #73
      && !origShape._connectivityBehavior._disabled
      && !destShape._connectivityBehavior._disabled) {
      const { _origShape: oldOrigShape, _destShape: oldDestShape } = this;
      const changeOrigShape = origShape !== oldOrigShape;
      const changeDestShape = destShape !== oldDestShape;
      let result = true;

      this._origShape = origShape;
      this._destShape = destShape;

      if (changeOrigShape) {
        if (oldOrigShape) {
          oldOrigShape.removeConnection(this, MODE.ORIG);
          this._removeDragListeners(oldOrigShape);
          this._points = [];
        }

        result = origShape.addOutgoingConnection(this);
        if (result) this._addDragListeners(origShape);
      }

      if (changeDestShape && result) {
        if (oldDestShape) {
          oldDestShape.removeConnection(this, MODE.DEST);
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

  isConnected() {
    return this._origShape && this._destShape;
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

      bounds.top = Math.min(y, bounds.top);
      bounds.right = Math.max(x, bounds.right);
      bounds.bottom = Math.max(y, bounds.bottom);
      bounds.left = Math.min(x, bounds.left);

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
      let intersection;
      const data = [];

      if (Geometry.isInLine(point, from, to)) {
        intersection = this._intersectionStrategy(point, { from, to }, lastIntersection);
      }

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

  _draw(origPortDescriptor, destPortDescriptor) {
    let points = [];

    if (origPortDescriptor) {
      points = this._waypointStrategy(origPortDescriptor, destPortDescriptor);
    }
    this._points = points;

    // TODO: this validation should be removed since it was added just for test a thing.
    if (this._origShape && this._destShape) {
      if (!(this._origShape.isBeingDragged() || this._destShape.isBeingDragged()
        || this._origShape.isBeingResized() || this._destShape.isBeingResized())) {
        this._updateIntersectionPoints();
      }
    }

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

    this._dom.mainElement.style.display = pathString ? '' : 'none';
    this._dom.path.setAttribute('d', pathString);

    return this;
  }

  _setPorts(origPort, destPort) {
    const { _origPort: oldOrigPort, _destPort: oldDestPort } = this;
    const atLeastOneNewPort = origPort !== oldOrigPort || destPort !== oldDestPort;
    let changed = false;

    if (atLeastOneNewPort) {
      this._origPort = origPort;
      this._destPort = destPort;
      changed = true;
    }

    if (!changed && origPort && destPort) {
      const origDesc = origPort.getDescription();
      const destDesc = destPort.getDescription();
      const oldOrigDesc = oldOrigPort.getDescription();
      const oldDestDesc = oldDestPort.getDescription();

      if (!Geometry.areSamePoint(origDesc.point, oldOrigDesc.point) || Geometry.areSamePoint(destDesc.point, oldDestDesc.point)) {
        changed = true;
      }
    }

    if (changed) {
      this._canvas.dispatchEvent(EVENT.PORT_CHANGE, this, {
        origPort,
        destPort,
        oldOrigPort,
        oldDestPort,
      });
    }
  }

  make() {
    if (!this._origShape || !this._destShape) return;

    const origPort = this._origShape.getConnectionPort(this._destShape, PORT_MODE.ORIG);
    const destPort = this._destShape.getConnectionPort(this._origShape, PORT_MODE.DEST);
    const origPortDescriptor = origPort.getDescription();
    const destPortDescriptor = destPort.getDescription();

    this._origShape.assignConnectionToPort(this, origPortDescriptor.portIndex, PORT_MODE.ORIG);
    this._destShape.assignConnectionToPort(this, destPortDescriptor.portIndex, PORT_MODE.DEST);
    this._setPorts(origPort, destPort);

    this._draw(origPortDescriptor, destPortDescriptor);
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

  toJSON() {
    return {
      ...super.toJSON(),
      orig: this._origShape.getID(),
      dest: this._destShape.getID(),
    };
  }

  _createHTML() {
    if (this._html) {
      return this;
    }

    super._createHTML();

    const mainElement = this._getMainElement();
    const arrowWrapper = BaseElement.createSVG('g');
    const arrowWrapper2 = BaseElement.createSVG('g');
    const arrow = BaseElement.createSVG('path');
    const path = BaseElement.createSVG('path');

    arrowWrapper2.setAttribute('transform', 'scale(0.5,0.5) rotate(-180)');
    arrow.setAttribute('end', 'target');
    arrow.setAttribute('d', 'M 0 0 L -13 -26 L 13 -26 z');
    arrow.classList.add('arrow');
    path.classList.add('path');

    arrowWrapper2.appendChild(arrow);
    arrowWrapper.appendChild(arrowWrapper2);
    mainElement.appendChild(arrowWrapper);
    mainElement.appendChild(path);

    this._html.classList.add('connection');
    this._dom.path = path;
    this._dom.arrow = arrowWrapper;
    this._dom.arrowRotateContainer = arrowWrapper2;
    this._selectBehavior.attach();
    this._dragBehavior.attach();

    return this;
  }
}

export default Connection;
