import _ from 'lodash';
import Element from '../core/Element';
import DragBehavior from './DragBehavior';
import Geometry from '../utils/Geometry';

export const EVENT = Object.freeze({
  START: 'resizestart',
  RESIZE: 'resize',
  END: 'resizeend',
});

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

  // eslint-disable-next-line object-curly-newline
  static isValidSize({ top, right, bottom, left }) {
    const width = right - left;
    const height = bottom - top;

    return width >= 1 && height >= 1;
  }

  constructor(target, settings) {
    super(target, settings);

    this._handlers = [];
    this._currentHandler = null;
    this._originalRatio = null;
    this._originalBound = null;
    this.endDrag = this.endDrag.bind(this);
  }

  _onGrab(event) {
    const { target: handler } = event;
    const { _target } = this;
    const { width, height } = _target.getSize();

    super._onGrab(event);

    this._originalRatio = width / height;
    this._currentHandler = handler;
    this._originalBound = _target.getBounds();
    _target.getCanvas().setResizingShape(_target);
  }

  startDrag(position, options) {
    const { _target } = this;

    if (!this._currentHandler) {
      this._currentHandler = this._handlers.find((handler) => handler.dataset.direction === options.direction);
    }

    // TODO: fix this access to a protected member.
    _target._controlsLayer.setActive();

    super.startDrag(position, options);
    // TODO: When Element inherits from EventTarget, the method
    // should trigger the event from itself.
    _target.getCanvas().dispatchEvent(EVENT.START, _target);
  }

  endDrag(event) {
    this._currentHandler = null;

    if (this._dragging) {
      const { _target } = this;
      const canvas = _target.getCanvas();

      this._updateHandlers();
      // TODO fix this access to protected member.
      _target._controlsLayer.setActive(false);
      super.endDrag(event);
      canvas.setResizingShape(null);
      canvas.dispatchEvent(EVENT.END, _target);
    }
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

  _getNewBounds({ x, y }, direction) {
    const bounds = { ...this._originalBound };

    switch (direction) {
      case DIRECTION.W:
      case DIRECTION.NW:
      case DIRECTION.SW:
        // TODO: fix this hardcoded value
        bounds.left = x + 6;
        break;
      case DIRECTION.E:
      case DIRECTION.NE:
      case DIRECTION.SE:
        bounds.right = x - 6;
        break;
      default:
    }

    switch (direction) {
      case DIRECTION.N:
      case DIRECTION.NW:
      case DIRECTION.NE:
        // TODO: fix this hardcoded value
        bounds.top = y + 6;
        break;
      case DIRECTION.S:
      case DIRECTION.SW:
      case DIRECTION.SE:
        // TODO: fix this hardcoded value
        bounds.bottom = y - 6;
        break;
      default:
    }

    return bounds;
  }

  _getModifiedBounds(bounds, modifiers, direction) {
    const newBounds = { ...bounds };

    if (modifiers.shiftKey) {
      const width = bounds.right - bounds.left;
      const height = bounds.bottom - bounds.top;
      const x = bounds.left + (width / 2);
      const y = bounds.top + (height / 2);
      const shapeRatio = this._originalRatio;
      let scaledWidth = width;
      let scaledHeight = height;
      const xAxis = [DIRECTION.W, DIRECTION.E];
      const yAxis = [DIRECTION.N, DIRECTION.S];
      let halfScaledW = null;
      let halfScaledH = null;

      if (!xAxis.includes(direction) && !yAxis.includes(direction)) {
        const boundRatio = width / height;

        if ((shapeRatio > 1 && boundRatio > 1)
          || (shapeRatio < 1 && boundRatio < 1)) {
          if (shapeRatio > boundRatio) {
            scaledHeight = width / shapeRatio;
          } else {
            scaledWidth = shapeRatio * height;
          }
        } else if (shapeRatio > 1) {
          scaledHeight = width / shapeRatio;
        } else {
          scaledWidth = shapeRatio * height;
        }
      } else if (!xAxis.includes(direction)) {
        scaledWidth = shapeRatio * height;
      } else {
        scaledHeight = width / shapeRatio;
      }

      halfScaledW = scaledWidth / 2;
      halfScaledH = scaledHeight / 2;

      switch (direction) {
        case DIRECTION.N:
          newBounds.left = x - halfScaledW;
          newBounds.right = x + halfScaledW;
        case DIRECTION.NW:
        case DIRECTION.NE:
          newBounds.top = newBounds.bottom - scaledHeight;
          break;
        case DIRECTION.S:
          newBounds.left = x - halfScaledW;
          newBounds.right = x + halfScaledW;
        case DIRECTION.SW:
        case DIRECTION.SE:
          newBounds.bottom = newBounds.top + scaledHeight;
          break;
        default:
      }

      switch (direction) {
        case DIRECTION.W:
          newBounds.top = y - halfScaledH;
          newBounds.bottom = y + halfScaledH;
        case DIRECTION.NW:
        case DIRECTION.SW:
          newBounds.left = newBounds.right - scaledWidth;
          break;
        case DIRECTION.E:
          newBounds.top = y - halfScaledH;
          newBounds.bottom = y + halfScaledH;
        case DIRECTION.NE:
        case DIRECTION.SE:
          newBounds.right = newBounds.left + scaledWidth;
          break;
        default:
      }
    }

    return newBounds;
  }

  updatePosition(position, options, modifiers) {
    if (!this._currentHandler) return;

    const { _target } = this;
    const direction = this._currentHandler.dataset.direction || options.direction;
    const bounds = this._getNewBounds(position, direction);
    const modifiedBounds = this._getModifiedBounds(bounds, modifiers, direction);

    if (!ResizeBehavior.isValidSize(modifiedBounds)) return;

    const { x, y, width, height } = Geometry.getBoundSizeAndPos(modifiedBounds);

    this.r.setAttribute('width', width + 12);
    this.r.setAttribute('height', height +12);
    this.r.setAttribute('x', x - ((width + 12) / 2));
    this.r.setAttribute('y', y - ((height +12) / 2));
    _target.adjustSize(modifiedBounds);
    this._updateHandlers(_target.getSize());

    super.updatePosition(position);
    // INFO: keep in mind this event is fired only when size of a shape is changing by dragging.
    _target.getCanvas().dispatchEvent(EVENT.RESIZE, _target);
  }

  getCurrentDirection() {
    return this._currentHandler && this._currentHandler.dataset.direction;
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate(point) {
    // INFO: This could be removed when implementing snap resizing.
    return point;
  }

  attachBehavior() {
    this._updateHandlers();
    this.r = Element.createSVG('rect');
    this._target.getCanvas()._html.prepend(this.r);
    this.r.setAttribute('fill', 'red');
    this.r.setAttribute('opacity', 0.5);
  }
}

export default ResizeBehavior;
