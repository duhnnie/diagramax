import DiagramUI from '../diagram/DiagramUI';
import { EVENT as SHAPE_EVENT } from './Shape';
import { EVENT as RESIZE_EVENT } from '../behavior/ResizeBehavior';
import BaseElement from '../core/BaseElement';

let handler;
class ShapeUI extends DiagramUI {
  static get type() {
    return 'shapeUI';
  }

  static createHandler({ classNames = [], dataset = {} } = {}) {
    if (!handler) {
      handler = BaseElement.createSVG('circle');
      handler.classList.add('handler');
    }

    const newHandler = handler.cloneNode(true);

    classNames = Array.isArray(classNames) ? classNames : [classNames];
    classNames.forEach((className) => newHandler.classList.add(className));
    Object.entries(dataset).forEach(([key, value]) => {
      newHandler.dataset[key] = value;
    });

    return newHandler;
  }

  constructor(...args) {
    super(...args);

    this._handleTargetMove = this._handleTargetMove.bind(this);
    this._handleTargetResize = this._handleTargetResize.bind(this);
  }

  _updatePosition({ x, y }) {
    if (this._html) {
      this._html.setAttribute('transform', `translate(${x}, ${y})`);
    }
  }

  _handleTargetResize(event, size, position) {
    this._updatePosition(position);
  }

  _handleTargetMove(event, position) {
    this._updatePosition(position);
  }

  _createHTML() {
    super._createHTML();

    const { _html, _target, _handleTargetMove } = this;

    _html.classList.add('shape-ui');
    _target.getCanvas()._dom.uiLayer.append(this._html);
    this._updatePosition(_target.getPosition());
    _target.getCanvas().addListener(RESIZE_EVENT.RESIZE, _target, this._handleTargetResize);
    _target.getCanvas().addListener(SHAPE_EVENT.POSITION_CHANGE, _target, _handleTargetMove);
    _target.getCanvas().addListener(SHAPE_EVENT.DRAG, _target, _handleTargetMove);

    return this;
  }

  // TODO: Next lines were commented since this listeners are no set back at undo(), so maybe when moving to
  // WebComponents it's not gonna be necessary to do this.
  remove() {
    const { _target, _handleTargetMove } = this;

    _target.getCanvas().removeListener(RESIZE_EVENT.RESIZE, _target, this._handleTargetResize);
    _target.getCanvas().removeListener(SHAPE_EVENT.POSITION_CHANGE, _target, _handleTargetMove);
    _target.getCanvas().removeListener(SHAPE_EVENT.DRAG, _target, _handleTargetMove);
    super.remove();
  }
}

export default ShapeUI;
