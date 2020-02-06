import Behavior from './Behavior';
import Shape from '../shape/Shape';

class ConnectivityBehavior extends Behavior {
  constructor (target, settings) {
    if (!(target instanceof Shape)) {
      throw new Error('DragAndDropBehavior: The settings parameter should be an instance of Shape');
    }

    super(target, settings);

    this._onClick = this._onClick.bind(this);
  }

  _onClick(event) {
    const target = this._target;

    event.stopPropagation();

    if (!target.isBeingDragged()) {
      const canvas = target.getCanvas();

      canvas.getConnectivityAreaBehavior().connectionClick(target, {
        x: event.clientX,
        y: event.clientY,
      });
    }
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('click', this._onClick, false);
  }
}

export default ConnectivityBehavior;
