import Command from './Command';

class ConnectCommand extends Command {
  constructor(receiver, origShape, destShape, connection) {
    super(receiver);

    this._after = {
      origShape,
      destShape,
      connection,
    };
  }

  execute() {
    const { origShape, destShape, connection = null } = this._after;

    this._after.connection = this._receiver.connect(origShape, destShape, connection);
  }

  undo() {
    this._after.connection.remove();
  }
}

export default ConnectCommand;
