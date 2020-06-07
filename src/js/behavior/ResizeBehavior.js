import Element from '../core/Element';
import DragBehavior from './DragBehavior';
import Geometry from '../utils/Geometry';

export const EVENT = Object.freeze({
  START: 'resizestart',
  RESIZE: 'resize',
  END: 'resizeend',
  SIZE_CHANGE: 'size:change',
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

const OPPOSITE_DIRECTION = {
  [DIRECTION.NW]: DIRECTION.SE,
  [DIRECTION.N]: DIRECTION.S,
  [DIRECTION.NE]: DIRECTION.SW,
  [DIRECTION.E]: DIRECTION.W,
  [DIRECTION.SE]: DIRECTION.NW,
  [DIRECTION.S]: DIRECTION.N,
  [DIRECTION.SW]: DIRECTION.NE,
  [DIRECTION.W]: DIRECTION.E,
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
    this._direction = null;
    this._centered = null;
    this._originalRatio = null;
    this._originalBound = null;
    this.endDrag = this.endDrag.bind(this);
    this._onTargetResize = this._bind(this._onTargetResize);
  }

  _onGrab(event) {
    const { target: handler } = event;
    const { _target } = this;

    super._onGrab(event);

    this._direction = handler.dataset.direction;
    _target.getCanvas().setResizingShape(_target);
  }

  startDrag(position, options) {
    const { _target } = this;
    const { width, height } = _target.getSize();

    if (this._direction === null) {
      this._direction = options.direction;
    }

    this._originalRatio = width / height;
    this._originalBound = _target.getBounds();

    // TODO: fix this access to a protected member.
    _target._componentUI.setActive();

    super.startDrag(position, options);
    // TODO: When Element inherits from EventTarget, the method
    // should trigger the event from itself.
    _target.getCanvas().dispatchEvent(EVENT.START, _target);
  }

  endDrag(event) {
    if (this._dragging) {
      const { _target } = this;
      const canvas = _target.getCanvas();

      canvas.setShapeSize(_target, _target.getCurrentSize(), this._centered ? null : this._direction);
      this._direction = null;
      this._centered = null;
      this._originalBound = null;
      this._originalRatio = null;
      this._updateHandlers();
      super.endDrag(event);
      canvas.setResizingShape(null);
      canvas.dispatchEvent(EVENT.END, _target);
    }
  }

  // TODO: Maybe the handlers should be updated in ShapeUI.
  _updateHandlers() {
    const { width: targetWidth, height: targetHeight } = this._target.getCurrentSize();
    const xPoints = [-1, 0, 1];
    const yPoints = [-1, 0, 1];
    const hOffset = (targetWidth * 0.5);
    const vOffset = (targetHeight * 0.5);
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

          // TODO: Fix this access to private member
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
        bounds.left = x;
        break;
      case DIRECTION.E:
      case DIRECTION.NE:
      case DIRECTION.SE:
        bounds.right = x;
        break;
      default:
    }

    switch (direction) {
      case DIRECTION.N:
      case DIRECTION.NW:
      case DIRECTION.NE:
        bounds.top = y;
        break;
      case DIRECTION.S:
      case DIRECTION.SW:
      case DIRECTION.SE:
        bounds.bottom = y;
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

  /**
   * Determines if the current Shape being resized should keep its position.
   * @param {Object} modifiers An object literal with all modifiers.
   * @returns {Boolean}
   */
  // eslint-disable-next-line class-methods-use-this
  _isCentered(modifiers) {
    return modifiers.altKey;
  }

  updatePosition(position, options, modifiers) {
    if (this._direction === null) return;

    const { _target } = this;
    const direction = this._direction;
    const bounds = this._getNewBounds(position, direction);
    const modifiedBounds = this._getModifiedBounds(bounds, modifiers, direction);

    if (!ResizeBehavior.isValidSize(modifiedBounds)) return;

    const { width, height } = Geometry.getBoundSizeAndPos(modifiedBounds);

    // NOTE: This different way to apply resizing is necessary to avoid erratic resizing for
    // shapes that have a fixed ratio of 1:1 like Circle.
    switch (direction) {
      case DIRECTION.W:
      case DIRECTION.E:
        _target._updateWidth(width);
        break;
      case DIRECTION.N:
      case DIRECTION.S:
        _target._updateHeight(height);
        break;
      default:
        _target._updateSize(width, height);
    }

    this._centered = this._isCentered(modifiers);

    if (this._centered) {
      const { x, y } = Geometry.getBoundSizeAndPos(this._originalBound);

      _target.setPosition(x, y);
    } else {
      _target.align(modifiedBounds, OPPOSITE_DIRECTION[direction]);
    }

    super.updatePosition(position);
    _target.getCanvas().dispatchEvent(EVENT.RESIZE, _target, { width, height }, _target.getCurrentPosition());
  }

  // eslint-disable-next-line class-methods-use-this
  _evaluate(point) {
    // INFO: This could be removed when implementing snap resizing.
    return point;
  }

  _onTargetResize() {
    this._updateHandlers();
  }

  attachBehavior() {
    const { _target } = this;
    const canvas = _target.getCanvas();

    this._updateHandlers();
    canvas.addEventListener(EVENT.RESIZE, _target, this._onTargetResize);
    canvas.addEventListener(EVENT.SIZE_CHANGE, _target, this._onTargetResize);
  }
}

export default ResizeBehavior;
