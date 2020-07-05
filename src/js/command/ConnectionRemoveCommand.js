import Command from './Command';

class ConnectionRemoveCommand extends Command {
  constructor(receiver) {
    super(receiver);

    this._after = {
      canvas: receiver.getCanvas(),
      orig: receiver.getOrigShape(),
      dest: receiver.getDestShape(),
    };
  }

  execute() {
    this._receiver.remove();
  }

  undo() {
    const { canvas, orig, dest } = this._after;

    canvas.connect(orig, dest, this._receiver);
  }
}

export default ConnectionRemoveCommand;
