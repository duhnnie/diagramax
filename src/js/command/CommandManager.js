import Command from './Command';

class CommandManager {
  constructor(settings) {
    settings = { ...settings };

    this._size = settings.size;
    this._stack = null;
    this._index = null;
    this.clear();
  }

  executeCommand(command) {
    if (!(command instanceof Command)) {
      throw new Error('executeCommand(): parameter should be a Command.');
    }

    this._stack.push(command);
    this.redo();
    this._stack = this._stack.slice(this._size * -1, this._index + 1);
    this._index = Math.min(this._index, this._size - 1);
  }

  undo() {
    const command = this._stack[this._index];

    if (command && command.undo() !== false) {
      this._index -= 1;
    }
  }

  redo() {
    const nextIndex = this._index + 1;
    const command = this._stack[nextIndex];

    if (command && command.execute() !== false) {
      this._index = nextIndex;
    }
  }

  clear() {
    this._stack = [];
    this._index = -1;
  }
}

export default CommandManager;
