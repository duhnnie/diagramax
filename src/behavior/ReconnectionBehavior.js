import Behavior from './Behavior';
import Element from '../core/Element';
import { EVENT as CONNECTION_EVENT, POINT as CONNECTION_POINT } from '../connection/Connection';
import { ORIENTATION } from '../connection/Port';
import Geometry from '../utils/Geometry';

function getFakeDescriptor(portDescription, point) {
  const position = Geometry.getNormalizedPosition(portDescription.point, point);
  let direction;

  // if (portDescription.orientation === ORIENTATION.X) {
  //   if (position.x === portDescription.direction) {
  //     direction = portDescription.direction * -1;
  //   } else {
  //     direction = portDescription.direction;
  //   }
  // } else {
  //   if (position.y === portDescription.direction) {
  //     direction = portDescription.direction * -1;
  //   } else {
  //     direction = portDescription.direction;
  //   }
  // }

  if ((portDescription.orientation === ORIENTATION.X && position.x === portDescription.direction) ||
  (portDescription.orientation === ORIENTATION.Y && position.y === portDescription.direction)) {
    direction = portDescription.direction * -1;
  } else {
    direction = portDescription.direction;
  }

  return {
    ...portDescription,
    point,
    direction,
  };
}

// TODO: next two lines and createHandler are duplicated in ResizeBehavior, an infraestructure for
// handle handlers could be created
const resizeHandlerRadius = 4;
let resizeHandler;
class ReconnectionBehavior extends Behavior {
  static createHandler(x, y) {
    if (!resizeHandler) {
      resizeHandler = Element.createSVG('circle');
      resizeHandler.setAttribute('r', resizeHandlerRadius);
      resizeHandler.setAttribute('fill', '#f44336');
    }

    const handlerClone = resizeHandler.cloneNode(true);

    handlerClone.setAttribute('cx', x);
    handlerClone.setAttribute('cy', y);

    return handlerClone;
  }

  constructor(target, settings) {
    super(target, settings);

    this._dom = {};
    this._onHandlerClick = this._onHandlerClick.bind(this);
  }

  startDrag(position, options) {
    console.log(position, options);
  }

  updatePosition(position, options, modifiers) {
    const isOrigin = Number(options.connectionPoint) === CONNECTION_POINT.ORIG;
    const currentHandler = isOrigin ? this._dom.origHandler : this._dom.destHandler;
    const otherPort = isOrigin ? this._target.getDestPort() : this._target.getOrigPort();
    const otherDescription = otherPort.getDescription();

    currentHandler.setAttribute('cx', position.x);
    currentHandler.setAttribute('cy', position.y);

    if (isOrigin) {
      this._target._draw(getFakeDescriptor(otherDescription, position), otherDescription);
    } else {
      this._target._draw(otherDescription, getFakeDescriptor(otherDescription, position));
    }
  }

  _onHandlerClick(event) {
    const { _target } = this;
    const { point } = event.target.dataset;

    _target.getCanvas().setDraggingConnection(_target, point);
  }

  _updateHandlers() {
    const { _target } = this;
    const origPort = _target.getOrigPort();
    const destPort = _target.getDestPort();
    const { point: origPoint = null } = (origPort && origPort.getDescription()) || {};
    const { point: destPoint = null } = (destPort && destPort.getDescription()) || {};

    if ([origPort, destPort].includes(null)) return;

    if (!this._dom.origHandler) {
      const commonClass = 'connection-handler';

      this._dom.origHandler = ReconnectionBehavior.createHandler(origPoint.x, origPoint.y);
      this._dom.destHandler = ReconnectionBehavior.createHandler(destPoint.x, destPoint.y);
      this._dom.origHandler.classList.add(commonClass);
      this._dom.destHandler.classList.add(commonClass);
      this._dom.origHandler.dataset.point = CONNECTION_POINT.ORIG;
      this._dom.destHandler.dataset.point = CONNECTION_POINT.DEST;
    }

    this._dom.origHandler.setAttribute('cx', origPoint.x);
    this._dom.origHandler.setAttribute('cy', origPoint.y);
    this._dom.destHandler.setAttribute('cx', destPoint.x);
    this._dom.destHandler.setAttribute('cy', destPoint.y);

    // TODO: Fix this access to private member
    _target._addControl(this._dom.origHandler, {
      click: this._onHandlerClick,
    });
    _target._addControl(this._dom.destHandler, {
      click: this._onHandlerClick,
    });
  }

  attachBehavior() {
    this._target.getCanvas().addEventListener(CONNECTION_EVENT.PORT_CHANGE, this._target, this._updateHandlers,
      this);
  }
}

export default ReconnectionBehavior;
