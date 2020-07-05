import Command from './Command';

class ShapeAddCommand extends Command {
  constructor(receiver, shape) {
    super(receiver);

    this._after = { shape };
  }

  execute() {
    this._receiver.addShape(this._after.shape);
  }

  undo() {
    this._after.shape.remove();
  }
}

export default ShapeAddCommand;
