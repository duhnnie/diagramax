import Command from './Command';

class ConnectCommand extends Command {
  constructor(receiver, origShape, destShape, connection) {
    super(receiver);

    this._before = {
      origShape: connection ? connection.getOrigShape() : null,
      destShape: connection ? connection.getDestShape() : null,
    };

    this._after = {
      origShape,
      destShape,
    };

    this._connection = connection;
  }

  execute() {
    const { origShape, destShape } = this._after;

    this._connection = this._receiver.connect(origShape, destShape, this._connection);
  }

  undo() {
    const { origShape, destShape } = this._before;

    if (origShape && destShape) {
      this._receiver.connect(origShape, destShape, this._connection);
    } else {
      this._connection.remove();
    }
  }
}

export default ConnectCommand;
