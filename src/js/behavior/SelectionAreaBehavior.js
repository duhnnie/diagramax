import Behavior from './Behavior';

// TODO: Use this events
const EVENT = Object.freeze({
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
    this._add = this._bind(this._add);
    this.clear = this.clear.bind(this);
  }

  contains(item) {
    return this._selection.has(item);
  }

  select(item) {
    // TODO: Accessing a protected member.
    const selectBehavior = item._selectBehavior;

    // TODO: Accessing a protected member.
    selectBehavior._select(this._add);
  }

  _add(item) {
    if (!this.contains(item)) {
      this._selection.add(item);

      return true;
    }

    return false;
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

  end() {
    this.clear();
  }

  get() {
    return Array.from(this._selection);
  }

  attach() {
    this._target.getElement().addEventListener('mousedown', this.clear, false);
  }

  detach() {
    this._target.getElement().removeEventListener('mousedown', this.clear, false);
    super.detach();
  }
}

export default SelectionAreaBehavior;
export { EVENT };
