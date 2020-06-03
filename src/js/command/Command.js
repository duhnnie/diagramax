class Command {
  constructor(receiver) {
    this._receiver = receiver;
    this._before = {};
    this._after = {};
  }

  // eslint-disable-next-line class-methods-use-this
  execute() {
    throw new Error('execute(): This method should be implemented.');
  }

  // eslint-disable-next-line class-methods-use-this
  undo() {
    throw new Error('undo(): This method should be implemented.');
  }
}

export default Command;
