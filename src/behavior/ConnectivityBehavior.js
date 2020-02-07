import Behavior from './Behavior';
import Shape from '../shape/Shape';

class ConnectivityBehavior extends Behavior {
  constructor (target, settings) {
    if (!(target instanceof Shape)) {
      throw new Error('DragAndDropBehavior: The settings parameter should be an instance of Shape');
    }

    super(target, settings);

    this._onClick = this._onClick.bind(this);
    this._onDblClick = this._onDblClick.bind(this);
  }

  _onClick(event) {
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

  _onDblClick() {
    const canvas = this._target.getCanvas();

    canvas.getConnectivityAreaBehavior().reset();
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('click', this._onClick, false);
    this._target.getHTML().addEventListener('dblclick', this._onDblClick, false);
  }
}

export default ConnectivityBehavior;
