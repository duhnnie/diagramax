import Command from './Command';

class ShapeTextCommand extends Command {
  constructor(receiver, text) {
    super(receiver);
    this._before = receiver.getText();
    this._after = text;
  }

  execute() {
    this._receiver.setText(this._after);
  }

  undo() {
    this._receiver.setText(this._before);
  }
}

export default ShapeTextCommand;
