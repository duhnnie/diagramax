import Behavior from './Behavior';
import Element from '../core/Element';
import { EVENT as CONNECTION_EVENT } from '../connection/Connection';

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
  }

  _updateHandlers() {
    const { _target } = this;
    const origPort = _target.getOrigPort();
    const destPort = _target.getDestPort();
    const { point: origPoint = null } = (origPort && origPort.getDescription()) || {};
    const { point: destPoint = null } = (destPort && destPort.getDescription()) || {};

    if ([origPort, destPort].includes(null)) return;

    if (!this._dom.origHandler) {
      this._dom.origHandler = ReconnectionBehavior.createHandler(origPoint.x, origPoint.y);
      this._dom.destHandler = ReconnectionBehavior.createHandler(destPoint.x, destPoint.y);
    }

    this._dom.origHandler.setAttribute('cx', origPoint.x);
    this._dom.origHandler.setAttribute('cy', origPoint.y);
    this._dom.destHandler.setAttribute('cx', destPoint.x);
    this._dom.destHandler.setAttribute('cy', destPoint.y);

    // TODO: Fix this access to private member
    this._target._addControl(this._dom.origHandler);
    this._target._addControl(this._dom.destHandler);
  }

  attachBehavior() {
    this._target.getCanvas().addEventListener(CONNECTION_EVENT.PORT_CHANGE, this._target, this._updateHandlers,
      this);
  }
}

export default ReconnectionBehavior;
