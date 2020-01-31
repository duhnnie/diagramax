import Element from '../core/Element';
import BPMNShape from '../shape/Shape';
// Deprecated
class DragAndDropManager {
  constructor(canvas) {
    this._canvas = canvas;
    this._target = null;
    this._fromTarget = null;
    this._diff = null;
    this._registry = {};
    this._dom = {};

    this._init();
  }

  _getShape(element) {
    return this._registry[element.id];
  }

  registerShape(shape) {
    this._registry[shape._id] = shape;
    return this;
  }

  unregisterShape(element) {
    delete this._registry[element.id];
    return this;
  }

  _init() {
    let diffX;
    let diffY;
    let canvasOffset;
    let dragged = false;

    $(window).on('scroll', () => canvasOffset = this._canvas.getHTML().getBoundingClientRect());

    $(this._canvas.getHTML()).on('click', (e) => {
      this._dom.line.setAttribute('stroke', '');
      this._fromTarget = null;
    }).on('mousemove', (e) => {
      if (this._target) {
        diffX = e.clientX - diffX;
        diffY = e.clientY - diffY;

        if (!dragged) {
          this._canvas.dispatchEvent(BPMNShape.EVENT.DRAG_START, this._target);
        }

        this._target.setPosition(this._target.getX() + diffX, this._target.getY() + diffY);
        dragged = true;

        this._canvas.dispatchEvent(BPMNShape.EVENT.DRAG, this._target);

        diffX = e.clientX;
        diffY = e.clientY;
      } else if (this._fromTarget) {
        diffX += e.clientX - diffX;
        diffY += e.clientY - diffY;

        this._dom.line.setAttribute('x2', diffX - canvasOffset.left + (this._fromTarget.getX() < diffX ? -1 : 1));
        this._dom.line.setAttribute('y2', diffY - canvasOffset.top + (this._fromTarget.getY() < diffY ? -1 : 1));
      }
    }).on('mouseleave', (e) => {
      if (this._target) {
        this._canvas.dispatchEvent(BPMNShape.EVENT.DRAG_END, this._target);
      }
      this._target = null;
      dragged = false;
    })
      .on('mousedown', '.shape', (e) => {
        this._target = this._getShape(e.currentTarget);

        diffX = e.clientX;
        diffY = e.clientY;
      })
      .on('click', '.shape', (e) => {
        let x;
        let y;
        let aux;

        e.stopPropagation();

        if (!dragged) {
          if (this._fromTarget) {
            this._canvas.connect(this._fromTarget, this._getShape(e.currentTarget));
            this._dom.line.setAttribute('stroke', '');
            this._fromTarget = null;
          } else {
            this._fromTarget = this._target;

            aux = this._fromTarget.getHTML().getBoundingClientRect();

            diffX = e.clientX - aux.left - (this._fromTarget.getWidth() / 2);
            diffY = e.clientY - aux.top - (this._fromTarget.getHeight() / 2);

            x = this._fromTarget.getX() + diffX;
            y = this._fromTarget.getY() + diffY;

            this._dom.line.setAttribute('x1', x);
            this._dom.line.setAttribute('y1', y);
            this._dom.line.setAttribute('x2', x);
            this._dom.line.setAttribute('y2', y);
            this._dom.line.setAttribute('stroke', 'black');
            this._canvas._dom.container.appendChild(this._dom.line);
          }
        }
        if (this._target && dragged) {
          this._canvas.dispatchEvent(BPMNShape.EVENT.DRAG_END, this._target);
        }
        this._target = null;
        dragged = false;
      })
      .on('dblclick', '.shape', (e) => {
        const shape = this._getShape(e.currentTarget);
        this._canvas._onSelectShape(shape);
      });

    this._dom.line = Element.createSVG('line');

    canvasOffset = this._canvas.getHTML().getBoundingClientRect();

    return this;
  }
}

export default DragAndDropManager;
