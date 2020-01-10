import Element from '../core/Element';
import Component from '../component/Component';
import BPMNShape from '../shape/Shape';
import ConnectionManager from './ConnectionManager';
import Port from './Port';
import ConnectionIntersectionResolver from './ConnectionIntersectionResolver';

const DEFAULTS = {
  origShape: null,
  destShape: null,
};

class Connection extends Component {
  static get ARROW_SEGMENT_LENGTH() {
    return 20;
  }

  static get INTERSECTION_SIZE() {
    return Object.freeze({
      WIDTH: 10,
      HEIGHT: 8,
    });
  }

  static _getSegmentOrientation(from, to) {
    let orientation;

    if (from.x === to.x) {
      orientation = Port.ORIENTATION.VERTICAL;
    } else {
      orientation = (from.y === to.y ? Port.ORIENTATION.HORIZONTAL : -1);
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

      if (segmentOrientation === Port.ORIENTATION.HORIZONTAL) {
        intersections.sort((a, b) => (a.x < b.x ? -1 : 1) * segmentDirection);
      } else {
        intersections.sort((a, b) => (a.y < b.y ? -1 : 1) * segmentDirection);
      }

      intersections.forEach((intersection) => {
        let halfArc;

        if (segmentOrientation === Port.ORIENTATION.HORIZONTAL) {
          halfArc = Connection.INTERSECTION_SIZE.WIDTH * segmentDirection * -0.5;
          segmentString += ` L${intersection.x + halfArc} ${intersection.y}`
                        + ` C${intersection.x + halfArc} ${intersection.y + Connection.INTERSECTION_SIZE.HEIGHT},`
                        + ` ${intersection.x - halfArc} ${intersection.y + Connection.INTERSECTION_SIZE.HEIGHT},`
                        + ` ${intersection.x - halfArc} ${intersection.y}`;
        } else {
          halfArc = Connection.INTERSECTION_SIZE.WIDTH * segmentDirection * -0.5;
          segmentString += ` L${intersection.x} ${intersection.y + halfArc}`
                        + ` C${intersection.x + Connection.INTERSECTION_SIZE.HEIGHT} ${intersection.y + halfArc},`
                        + ` ${intersection.x + Connection.INTERSECTION_SIZE.HEIGHT} ${intersection.y - halfArc},`
                        + ` ${intersection.x} ${intersection.y - halfArc}`;
        }
      });
    }

    segmentString += ` L${to.x} ${to.y}`;

    return segmentString;
  }

  constructor(settings) {
    super(settings);
    this._points = [];
    this._origShape = null;
    this._destShape = null;

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this.setOrigShape(settings.origShape)
      .setDestShape(settings.destShape);
  }

  _onShapeDragStart() {
    this._html.setAttribute('opacity', 0.3);
  }

  _onShapeDragEnd() {
    this._html.setAttribute('opacity', 1);
    this._draw(ConnectionIntersectionResolver.getIntersectionPoints(this));
  }

  _addDragListeners(shape) {
    this._canvas.addEventListener(BPMNShape.EVENT.DRAG_START, shape, this._onShapeDragStart, this);
    this._canvas.addEventListener(BPMNShape.EVENT.DRAG_END, shape, this._onShapeDragEnd, this);

    return this;
  }

  _removeDragListeners(shape) {
    this._canvas.removeEventListener(BPMNShape.EVENT.DRAG_START, shape, this._onShapeDragStart,
      this);
    this._canvas.removeEventListener(BPMNShape.EVENT.DRAG_END, shape, this._onShapeDragEnd,
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

  getBBoxExtremePoints() {
    if (this._html) {
      const bbox = this._dom.path.getBBox();

      return {
        min: {
          x: bbox.x,
          y: bbox.y,
        },
        max: {
          x: bbox.x + bbox.width,
          y: bbox.y + bbox.height,
        },
      };
    }
    return {
      min: { x: 0, y: 0 },
      max: { x: 0, y: 0 },
    };
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

  _draw(intersections = null) {
    const pointsLength = this._points.length;
    let pathString = '';

    if (pointsLength > 0) {
      const points = this._points;
      const lastSegmentOrientation = Connection._getSegmentOrientation(points[pointsLength - 2],
        points[pointsLength - 1]);
      const lastSegmentDirection = Connection._getSegmentDirection(points[pointsLength - 2],
        points[pointsLength - 1]);
      const arrowAngle = (lastSegmentOrientation === Port.ORIENTATION.HORIZONTAL
        ? 2 + lastSegmentDirection
        : 1 + (lastSegmentDirection * -1));

      intersections = intersections || [];

      pathString += `M${points[0].x} ${points[0].y}`;

      for (let i = 1; i < pointsLength; i += 1) {
        pathString += Connection.getSegmentDrawing(points[i - 1], points[i], intersections[i - 1]);
      }

      this._dom.arrow.setAttribute('transform', `translate(${points[points.length - 1].x}, ${points[points.length - 1].y})`);
      this._dom.arrowRotateContainer.setAttribute('transform', `scale(0.5, 0.5) rotate(${90 * arrowAngle})`);
    }

    this._dom.arrow.style.display = pathString ? '' : 'none';
    this._dom.path.setAttribute('d', pathString);
    this._html.appendChild(this._dom.arrow);

    return this;
  }

  connect() {
    if (this._html && this._origShape && this._destShape && this._origShape !== this.destShape) {
      let waypoints;
      const portIndexes = ConnectionManager.getConnectionPortIndexes(this._origShape, this._destShape);
      const origPortDescriptor = this._origShape.getPortDescriptor(portIndexes.orig);
      const destPortDescriptor = this._destShape.getPortDescriptor(portIndexes.dest); 

      if (origPortDescriptor) {
        this._origShape.assignConnectionToPort(this, origPortDescriptor.portIndex);
        this._destShape.assignConnectionToPort(this, destPortDescriptor.portIndex);

        waypoints = ConnectionManager.getWaypoints(origPortDescriptor, destPortDescriptor);

        waypoints.push({
          x: destPortDescriptor.point.x,
          y: destPortDescriptor.point.y,
        });

        waypoints.unshift({
          x: origPortDescriptor.point.x,
          y: origPortDescriptor.point.y,
        });
      }

      this._points = waypoints || [];
      this._draw();
    }

    return this;
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

    return this.connect();
  }
}

export default Connection;
