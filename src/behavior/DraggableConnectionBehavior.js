import DragBehavior from './DragBehavior';
import Element from '../core/Element';
import { EVENT as CONNECTION_EVENT } from '../connection/Connection';
import { ORIENTATION, MODE as PORT_MODE } from '../connection/Port';
import Geometry from '../utils/Geometry';

// TODO: next two lines and createHandler are duplicated in ResizeBehavior, an infraestructure for
// handle handlers could be created
const resizeHandlerRadius = 4;
let resizeHandler;

class DraggableConnectionBehavior extends DragBehavior {
  static createHandler() {
    if (!resizeHandler) {
      resizeHandler = Element.createSVG('circle');
      resizeHandler.setAttribute('r', resizeHandlerRadius);
      resizeHandler.setAttribute('fill', '#f44336');
    }

    return resizeHandler.cloneNode(true);
  }

  constructor(target, settings) {
    super(target, settings);

    this._dom = {};
    this._origShape = null;
    this._destShape = null;
    this._onPortChange = this._onPortChange.bind(this);
  }

  startDrag(position, options) {
    this._dom.origHandler.setAttribute('pointer-events', 'none');
    this._dom.destHandler.setAttribute('pointer-events', 'none');
    // TODO: next line is a workaround, find a way to allow click into canvas with a Connection.
    this._target.getHTML().setAttribute('pointer-events', 'none');
  }

  start(shape) {
    this._origShape = shape;
    this._target.getCanvas().setDraggingConnection(this._target, PORT_MODE.DEST);
  }

  end() {
    const { _target } = this;

    this._dom.origHandler.removeAttribute('pointer-events');
    this._dom.destHandler.removeAttribute('pointer-events');
    // TODO: next line is a workaround, find a way to allow click into canvas with a Connection.
    this._target.getHTML().removeAttribute('pointer-events');

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

  _getFakeDescription(position) {
    const diff = Geometry.getNormalizedPosition(position, this._origShape.getPosition());
    const bounds = this._origShape.getBounds();
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

  updatePosition(position, options, modifiers) {
    const description = this._destShape ? this._destShape.getConnectionPort(this._origShape, PORT_MODE.DEST).getDescription() : this._getFakeDescription(position, this._origShape.getPosition());
    const otherPort = this._origShape.getConnectionPort(description, PORT_MODE.ORIG);
    const otherDescription = otherPort.getDescription();

    this._updateHandlers(otherDescription, description);
    this._target._draw(otherDescription, description);
  }

  _onGrab(event) {
    const { _target } = this;
    const { point } = event.target.dataset;

    super._onGrab(event);

    _target.getCanvas().setDraggingConnection(_target, point);
  }

  onShape(shape) {
    this._destShape = shape;
  }

  outShape(shape) {
    this._destShape = null;
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

  attachBehavior() {
    const { _target } = this;

    _target.getCanvas().addEventListener(CONNECTION_EVENT.PORT_CHANGE, _target, this._onPortChange,
      this);

    this._createHandlers();
  }
}

export default DraggableConnectionBehavior;
