import Command from './Command';
import { MODE } from '../connection/Port';

class ShapeRemoveCommand extends Command {
  constructor(receiver) {
    super(receiver);

    this._before = {
      canvas: receiver.getCanvas(),
      connections: receiver.getConnectedShapes(),
    };
  }

  execute() {
    this._receiver.remove();
  }

  undo() {
    const { canvas, connections } = this._before;

    canvas.addShape(this._receiver);
    connections.forEach(([otherShape, direction]) => {
      if (direction === MODE.ORIG) {
        canvas.connect(otherShape, this._receiver);
      } else {
        canvas.connect(this._receiver, otherShape);
      }
    });
  }
}

export default ShapeRemoveCommand;
