import Command from './Command';

class CommandManager {
  constructor(settings) {
    settings = { ...settings };

    this._size = settings._size;
    this._stack = null;
    this._index = null;
    this.clear();
  }

  executeCommand(command) {
    if (!(command instanceof Command)) {
      throw new Error('executeCommand(): parameter should be a Command.');
    }

    this._stack = this._stack.slice(0, this._index + 1);
    this._stack.push(command);
    this.redo();
  }

  undo() {
    const command = this._stack[this._index];

    if (command) {
      command.undo();
      this._index -= 1;
    }
  }

  redo() {
    const nextIndex = this._index + 1;
    const command = this._stack[nextIndex];

    if (command) {
      command.execute();
      this._index = nextIndex;
    }
  }

  clear() {
    this._stack = [];
    this._index = -1;
  }
}

export default CommandManager;
