import Behavior from './Behavior';
import Element from '../core/Element';
import { EVENT as CONNECTION_EVENT, POINT as CONNECTION_POINT } from '../connection/Connection';
import { ORIENTATION, MODE } from '../connection/Port';
import Geometry from '../utils/Geometry';
import { PRODUCTS } from '../connection/WaypointStrategyRepository';

// TODO: next two lines and createHandler are duplicated in ResizeBehavior, an infraestructure for
// handle handlers could be created
const resizeHandlerRadius = 4;
let resizeHandler;
class ReconnectionBehavior extends Behavior {
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
    // this._lastPosition = null;
    this._onHandlerClick = this._onHandlerClick.bind(this);
  }

  startDrag(position, options) {
    this._dom.origHandler.setAttribute('pointer-events', 'none');
    this._dom.destHandler.setAttribute('pointer-events', 'none');
    // TODO: next line is a workaround, find a way to allow click into canvas with a Connection.
    this._target.getHTML().setAttribute('pointer-events', 'none');
    // this._lastPosition = position;
  }

  start(shape) {
    this._origShape = shape;
    this._target.getCanvas().setDraggingConnection(this._target, CONNECTION_POINT.DEST);
  }

  endDrag() {
    const { _target } = this;
    const canvas = _target.getCanvas();

    // canvas.startConnection(null);

    if (_target.getOrigShape() && _target.getDestShape()) {
      _target.make();
    } else {
      _target.remove();
    }
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
      mode: MODE.IN,
    };
  }

  _getOtherPort(position, isOrigin) {
    const { _target } = this;
    const otherPort = isOrigin ? this._target.getDestPort() : this._target.getOrigPort();

    if (!otherPort) {
      return this._target._portPriorityStrategy(this._origShape, );
    }
  }

  updatePosition(position, options, modifiers) {
    // console.log(position, this._lastPosition);
    // const isOrigin = Number(options.connectionPoint) === CONNECTION_POINT.ORIG;
    const description = this._destShape ? this._destShape.getConnectionPort(this._origShape, MODE.IN).getDescription() : this._getFakeDescription(position, this._origShape.getPosition());
    // const currentHandler = isOrigin ? this._dom.origHandler : this._dom.destHandler;
    const otherPort = this._origShape.getConnectionPort(description, 1);
    const otherDescription = otherPort.getDescription();
    // const otherDescription = otherPort.getDescription();

    // currentHandler.setAttribute('cx', position.x);
    // currentHandler.setAttribute('cy', position.y);

    // if (isOrigin) {
      //   this._target._draw(_getFakeDescription(otherDescription, position), otherDescription);
      // } else {
        //   this._target._draw(otherDescription, _getFakeDescription(otherDescription, position));
        // }


    this._updateHandlers();
    this._target._draw(otherDescription, description);
    // this._lastPosition = position;
  }

  _onHandlerClick(event) {
    const { _target } = this;
    const { point } = event.target.dataset;

    _target.getCanvas().setDraggingConnection(_target, point);
  }

  onShape(shape) {
    this._destShape = shape;
  }

  outShape(shape) {
    this._destShape = null;
  }

  _updateHandlers() {
    const { _target } = this;
    const origPort = _target.getOrigPort();
    const destPort = _target.getDestPort();
    const { point: origPoint = null } = (origPort && origPort.getDescription()) || {};
    const { point: destPoint = null } = (destPort && destPort.getDescription()) || {};
    // const { point: origPoint = null } = origDescription;
    // const { point: destPoint = null } = destDescription;

    if (!this._dom.origHandler) {
      const commonClass = 'connection-handler';

      this._dom.origHandler = ReconnectionBehavior.createHandler();
      this._dom.destHandler = ReconnectionBehavior.createHandler();
      this._dom.origHandler.classList.add(commonClass);
      this._dom.destHandler.classList.add(commonClass);
      this._dom.origHandler.dataset.point = CONNECTION_POINT.ORIG;
      this._dom.destHandler.dataset.point = CONNECTION_POINT.DEST;

      // TODO: Fix this access to private member
      _target._addControl(this._dom.origHandler, {
        click: this._onHandlerClick,
      });
      _target._addControl(this._dom.destHandler, {
        click: this._onHandlerClick,
      });
    }

    if ([origPoint, destPoint].includes(null)) return;

    this._dom.origHandler.setAttribute('cx', origPoint.x);
    this._dom.origHandler.setAttribute('cy', origPoint.y);
    this._dom.destHandler.setAttribute('cx', destPoint.x);
    this._dom.destHandler.setAttribute('cy', destPoint.y);
  }

  attachBehavior() {
    const { _target } = this;
    const origPort = _target.getOrigPort();
    const destPort = _target.getDestPort();

    _target.getCanvas().addEventListener(CONNECTION_EVENT.PORT_CHANGE, _target, this._updateHandlers,
      this);

    // if (origPort && destPort) {
      this._updateHandlers();
    // }
  }
}

export default ReconnectionBehavior;
