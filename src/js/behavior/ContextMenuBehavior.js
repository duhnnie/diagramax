import Behavior from './Behavior';

class ContextMenuBehavior extends Behavior {
  constructor(...args) {
    super(...args);

    this.onContextMenu = this._bind(this.onContextMenu);
  }

  // eslint-disable-next-line class-methods-use-this
  onContextMenu() {
    throw new Error('Not implemented.');
  }

  attach() {
    // TODO: Fix access to protected method.
    const mainElement = this._target._getMainElement();

    mainElement.addEventListener('contextmenu', this.onContextMenu, false);
    super.attach();
  }

  detach() {
    // TODO: Fix access to protected method.
    const mainElement = this._target._getMainElement();

    mainElement.addEventListener('contextmenu', this.onContextMenu, false);
    super.detach();
  }
}

export default ContextMenuBehavior;
