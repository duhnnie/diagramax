import _ from 'lodash';
import Element from '../core/Element';
import DragBehavior from './DragBehavior';

export const DIRECTION = {
  NW: 'nw',
  N: 'n',
  NE: 'ne',
  E: 'e',
  SE: 'se',
  S: 's',
  SW: 'sw',
  W: 'w',
};

const handlerDefs = [
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

    this._handlers = [];
    this._currentHandler = null;
    this._onGrab = this._onGrab.bind(this);
    this.endDrag = this.endDrag.bind(this);
  }

  _updateHandlers(newSize) {
    const { width: targetWidth, height: targetHeight } = newSize || this._target.getSize();
    const xPoints = [-1, 0, 1];
    const yPoints = [-1, 0, 1];
    const hOffset = (targetWidth * 0.5) + (resizeHandlerRadius * 1.5);
    const vOffset = (targetHeight * 0.5) + (resizeHandlerRadius * 1.5);
    let index = 0;

    yPoints.forEach((y) => {
      xPoints.forEach((x) => {
        // If x and y are 0
        if (!x && !y) return;

        const handler = this._handlers[index];
        const xPos = hOffset * x;
        const yPos = vOffset * y;

        if (handler) {
          handler.setAttribute('cx', xPos);
          handler.setAttribute('cy', yPos);
        } else {
          const newHandler = ResizeBehavior.createHandler(xPos, yPos);
          const { className, direction } = handlerDefs[index];

          newHandler.classList.add(`handler-resize-${className}`);
          newHandler.dataset.direction = direction;

          this._target._addControl(newHandler, {
            mousedown: this._onGrab,
            mouseup: this.endDrag,
          });

          this._handlers[index] = newHandler;
        }

        index += 1;
      });
    });
  }

  _onGrab(event) {
    const { target: handler } = event;

    super._onGrab(event);

    this._currentHandler = handler;
    // TODO: fix this access to a protected member.
    this._target._controlsLayer.setActive();
    this._target.getCanvas().setResizingShape(this._target);
  }

  endDrag() {
    this._currentHandler = null;
    this._updateHandlers();
    // TODO fix this access to protected member.
    this._target._controlsLayer.setActive(false);
    super.endDrag();
  }

  updatePosition(position, lastPosition, options) {
    if (!this._currentHandler) return;

    const direction = this._currentHandler.dataset.direction || options.direction;
    const { x, y } = position;
    const bounds = this._target.getBounds();
    const newWidth = bounds.right - bounds.left;
    const newHeight = bounds.bottom - bounds.top;

    switch (direction) {
      case DIRECTION.NW:
        // TODO: fix this hardcoded value
        bounds.left = x + 6;
        bounds.top = y + 6;
        break;
      case DIRECTION.NE:
        // TODO: fix this hardcoded value
        bounds.right = x - 6;
        bounds.top = y + 6;
        break;
      case DIRECTION.N:
        // TODO: fix this hardcoded value
        bounds.top = y + 6;
        break;
      case DIRECTION.E:
        // TODO fix this hardcoded value
        bounds.right = x - 6;
        break;
      case DIRECTION.SE:
        // TODO fix this hardcoded value
        bounds.right = x - 6;
        bounds.bottom = y - 6;
        break;
      case DIRECTION.S:
        // TODO fix this hardcoded value
        bounds.bottom = y - 6;
        break;
      case DIRECTION.SW:
        // TODO fix this hardcoded value
        bounds.left = x + 6;
        bounds.bottom = y - 6;
        break;
      case DIRECTION.W:
        // TODO fix this hardcoded value
        bounds.left = x + 6;
        break;
      default:
    }

    this._updateHandlers({ width: newWidth, height: newHeight });

    this._target.setPosition(
      bounds.left + (newWidth / 2),
      bounds.top + (newHeight / 2),
    );

    this._target.setSize(
      (bounds.right - bounds.left),
      (bounds.bottom - bounds.top),
    );

    super.updatePosition(position);
  }

  attachBehavior() {
    this._updateHandlers();
  }
}

export default ResizeBehavior;
