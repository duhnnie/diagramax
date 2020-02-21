import Behavior from './Behavior';

export const EVENT = Object.freeze({
  ADD: 'selectionadd',
  REMOVE: 'selectionremove',
  CLEAR: 'selectionclear',
});

class SelectionAreaBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    // TODO: Maybe use a WeakSet, but we have to find another way to implement clear() since
    // it iterates over it.
    this._selection = new Set();
  }

  contains(item) {
    return this._selection.has(item);
  }

  add(item) {
    if (!this.contains(item)) {
      this._selection.add(item);
      item.select();
    }

    return this;
  }

  remove(item) {
    if (this.contains(item)) {
      item.unselect();
      this._selection.delete(item);
    }

    return this;
  }

  clear() {
    this._selection.forEach((item) => {
      this.remove(item);
    });

    return this;
  }

  get() {
    return Array.from(this._selection);
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('click', () => this.clear(), false);
  }
}

export default SelectionAreaBehavior;
