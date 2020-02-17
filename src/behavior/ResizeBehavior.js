import _ from 'lodash';
import Element from '../core/Element';
import DragBehavior from './DragBehavior';

export const DIRECTION = {
  N: 'n',
  NE: 'ne',
  E: 'e',
  SE: 'se',
  S: 's',
  SW: 'sw',
  W: 'w',
  NW: 'nw',
};

const resizeHandlerDefs = [
  {
    className: 'nwse',
    direction: DIRECTION.NW,
  },
  {
    className: 'ns',
    direction: DIRECTION.N,
  },
  {
    className: 'nesw',
    direction: DIRECTION.NE,
  },
  {
    className: 'ew',
    direction: DIRECTION.W,
  },
  {
    className: 'ew',
    direction: DIRECTION.E,
  },
  {
    className: 'nesw',
    direction: DIRECTION.SW,
  },
  {
    className: 'ns',
    direction: DIRECTION.S,
  },
  {
    className: 'nwse',
    direction: DIRECTION.SE,
  },
];

const resizeHandlerRadius = 4;
let resizeHandler;

class ResizeBehavior extends DragBehavior {
  static getResizeHandler(x, y) {
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

    this._currentHandler = null;
    this._onGrab = this._onGrab.bind(this);
  }

  _onGrab(event) {
    const { target: handler } = event;

    super._onGrab(event);

    this._currentHandler = handler.dataset.direction;
    this._target.getCanvas().setResizingShape(this._target, 'asd', {});
  }

  _createControls() {
    const { width: targetWidth, height: targetHeight } = this._target.getSize();
    const horizontalOffset = (targetWidth * 0.5) + (resizeHandlerRadius * 1.5);
    const verticalOffset = (targetHeight * 0.5) + (resizeHandlerRadius * 1.5);
    const horizontalPositions = [-horizontalOffset, 0, horizontalOffset];
    let index = 0;

    [-verticalOffset, 0, verticalOffset].forEach((y) => {
      horizontalPositions.forEach((x) => {
        if (y === 0 && x === 0) return;

        const control = ResizeBehavior.getResizeHandler(x, y);
        const { className, direction } = resizeHandlerDefs[index];


        control.classList.add(`handler-resize-${className}`);
        control.dataset.direction = direction;
        this._target._addControl(control, {
          mousedown: this._onGrab,
        });
        index += 1;
      });
    });
  }

  updatePosition(diff, options) {
    const direction = this._currentHandler || options.direction;

    console.log(direction);
  }

  attachBehavior() {
    this._createControls();
  }
}

export default ResizeBehavior;
