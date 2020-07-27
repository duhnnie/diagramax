import ErrorThrower from '../utils/ErrorThrower';

class Command {
  constructor(receiver) {
    this._receiver = receiver;
    this._before = null;
    this._after = null;
  }

  // eslint-disable-next-line class-methods-use-this
  execute() {
    ErrorThrower.notImplemented();
  }

  // eslint-disable-next-line class-methods-use-this
  undo() {
    ErrorThrower.notImplemented();
  }
}

export default Command;
