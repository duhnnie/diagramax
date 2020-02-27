import Behavior from './Behavior';
import Shape from '../shape/Shape';
import { EVENT as DRAG_EVENT } from './DraggableShapeBehavior';

class ConnectivityBehavior extends Behavior {
  constructor(target, settings) {
    if (!(target instanceof Shape)) {
      throw new Error('DragAndDropBehavior: The settings parameter should be an instance of Shape');
    }

    super(target, settings);

    this._onDblClick = this._bind(this._onDblClick);
    this.end = this.end.bind(this);
  }

  _onDblClick(event) {
    const target = this._target;

    event.stopPropagation();

    if (!target.isBeingDragged()) {
      const canvas = target.getCanvas();

      canvas.getConnectivityAreaBehavior().addShape(target, {
        x: event.clientX,
        y: event.clientY,
      });
    }
  }

  end() {
    this._target.getCanvas().getConnectivityAreaBehavior().end();
  }

  attachBehavior() {
    const { _target } = this;
    const canvas = _target.getCanvas();

    this._target.getHTML().addEventListener('dblclick', this._onDblClick, false);
    canvas.addEventListener(DRAG_EVENT.START, _target, this.end);
  }

  detachBehavior() {
    const { _target } = this;
    const canvas = _target.getCanvas();

    _target.getHTML().removeEventListener('dblclick', this._onDblClick, false);
    canvas.removeEventListener(DRAG_EVENT.START, _target, this.end);
    super.detachBehavior();
  }
}

export default ConnectivityBehavior;
