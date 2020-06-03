import Command from './Command';

class ShapePositioningCommand extends Command {
  constructor(shape, position) {
    super(shape);

    this._before = shape.getPosition();
    this._after = { ...position };
  }

  execute() {
    this._receiver.setPosition(this._after);
  }

  undo() {
    this._receiver.setPosition(this._before);
  }
}

export default ShapePositioningCommand;
