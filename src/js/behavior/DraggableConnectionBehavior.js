import DragBehavior from './DragBehavior';
import BaseElement from '../core/BaseElement';
import { EVENT as CONNECTION_EVENT } from '../connection/Connection';
import { ORIENTATION, MODE as PORT_MODE } from '../connection/Port';
import Geometry from '../utils/Geometry';

// TODO: next two lines and createHandler are duplicated in ResizeBehavior, an infraestructure for
// handle handlers could be created
const resizeHandlerRadius = 4;
let resizeHandler;

function getFakeDescription(position, shape) {
  const diff = Geometry.getNormalizedPosition(position, shape.getPosition());
  const bounds = shape.getBounds();
  let orientation = ORIENTATION.X;
  let direction;

  if (Geometry.isInBetween(position.x, bounds.left, bounds.right)) {
    orientation = ORIENTATION.Y;
  }

  if (orientation === ORIENTATION.Y) {
    direction = diff.y;
  } else {
    direction = diff.x;
  }

  return {
    direction,
    orientation,
    point: position,
    mode: PORT_MODE.DEST,
  };
}

class DraggableConnectionBehavior extends DragBehavior {
  static createHandler() {
    if (!resizeHandler) {
      resizeHandler = BaseElement.createSVG('circle');
      resizeHandler.setAttribute('r', resizeHandlerRadius);
      resizeHandler.setAttribute('fill', '#f44336');
    }

    return resizeHandler.cloneNode(true);
  }

  constructor(target, settings) {
    super(target, settings);

    this._dom = {};
    this._shape = null;
    this._otherShape = null;
    this._onPortChange = this._onPortChange.bind(this);
  }

  startDrag(position, options) {
    super.startDrag();
    this._dom.origHandler.setAttribute('pointer-events', 'none');
    this._dom.destHandler.setAttribute('pointer-events', 'none');
    // TODO: next line is a workaround, find a way to allow click into canvas with a Connection.
    this._target.getHTML().setAttribute('pointer-events', 'none');
  }

  start(shape, draggingPoint) {
    this._shape = shape;
    this._target.getCanvas().setDraggingConnection(this._target, draggingPoint);
  }

  _onGrab(event) {
    const { _target } = this;
    const draggingPoint = Number(event.target.dataset.point);

    super._onGrab(event);
    _target.getCanvas().startReconnection(_target, draggingPoint);
  }

  end() {
    const { _target } = this;

    // TODO: this avoid to calling this method more than necessaty times, but maybe it should be replaced by a variable
    // like _ended and another to identify if the behavior was started like _started.
    if (!this._shape && !this._otherShape) return;

    super.endDrag();

    this._shape = null;
    this._otherShape = null;
    this._dom.origHandler.removeAttribute('pointer-events');
    this._dom.destHandler.removeAttribute('pointer-events');
    // TODO: next line is a workaround, find a way to allow click into canvas with a Connection.
    this._target.getHTML().removeAttribute('pointer-events');

    // TODO: Check if all inherited classes from DragBehavior make following call,
    // if they do, so it could be move to its end() method.
    this._target.getCanvas().setDraggingConnection(null);

    if (_target.getOrigShape() && _target.getDestShape()) {
      _target.make();
    } else {
      _target.remove();
    }
  }

  // TODO: Consider remove endDrag() method in favor of end().
  endDrag() {
    this.end();
  }

  updatePosition(position, { draggingPoint }, modifiers) {
    const shape = this._shape;
    const draggingOrig = draggingPoint === PORT_MODE.ORIG;
    const mode = draggingOrig ? PORT_MODE.DEST : PORT_MODE.ORIG;
    const fakeDescription = this._otherShape ? this._otherShape.getConnectionPort(shape, draggingPoint).getDescription() : getFakeDescription(position, shape);
    const shapePort = shape.getConnectionPort(fakeDescription, mode);
    const description = shapePort.getDescription();

    if (draggingOrig) {
      this._updateHandlers(fakeDescription, description);
      this._target._draw(fakeDescription, description);
    } else {
      this._updateHandlers(description, fakeDescription);
      this._target._draw(description, fakeDescription);
    }
  }

  onShape(shape) {
    this._otherShape = shape;
  }

  outShape(shape) {
    this._otherShape = null;
  }

  _getControlsListeners() {
    return {
      mousedown: this._onGrab,
      mouseup: this._onRelease,
    };
  }

  _createHandlers() {
    const { _target } = this;

    if (!this._dom.origHandler) {
      const commonClass = 'connection-handler';

      this._dom.origHandler = DraggableConnectionBehavior.createHandler();
      this._dom.destHandler = DraggableConnectionBehavior.createHandler();
      this._dom.origHandler.classList.add(commonClass);
      this._dom.destHandler.classList.add(commonClass);
      this._dom.origHandler.dataset.point = PORT_MODE.ORIG;
      this._dom.destHandler.dataset.point = PORT_MODE.DEST;

      // TODO: Fix this access to private member
      _target._addControl(this._dom.origHandler, this._getControlsListeners());
      _target._addControl(this._dom.destHandler, this._getControlsListeners());
    }
  }

  _updateHandlers({ point: origPoint }, { point: destPoint }) {
    if ([origPoint, destPoint].includes(null)) return;

    this._dom.origHandler.setAttribute('cx', origPoint.x);
    this._dom.origHandler.setAttribute('cy', origPoint.y);
    this._dom.destHandler.setAttribute('cx', destPoint.x);
    this._dom.destHandler.setAttribute('cy', destPoint.y);
  }

  _onPortChange(customEvent, { origPort, destPort }) {
    if (origPort && destPort) {
      this._updateHandlers(origPort.getDescription(), destPort.getDescription());
    }
  }

  _getDraggableElement() {
    return [this._dom.origHandler, this._dom.destHandler];
  }

  attach() {
    const { _target } = this;

    _target.getCanvas().addEventListener(CONNECTION_EVENT.PORT_CHANGE, _target, this._onPortChange,
      this);

    this._createHandlers();
    super.attach();
  }
}

export default DraggableConnectionBehavior;
