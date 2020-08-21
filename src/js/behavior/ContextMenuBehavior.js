import Behavior from './Behavior';
import DiagramElement from '../diagram/DiagramElement';

class ContextMenuBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this.onContextMenu = this._bind(this.onContextMenu);
  }

  onContextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    this._target.onContextMenu(event);
  }

  attach() {
    const { _target } = this;
    let element;

    // TODO: all targets should implement all interfaces, so this is a hack
    if (_target instanceof DiagramElement) {
      // TODO: Fix access to protected method.
      element = _target._getMainElement();
    } else {
      element = _target.getElement();
    }

    element.addEventListener('contextmenu', this.onContextMenu, false);
    super.attach();
  }

  detach() {
    const { _target } = this;
    let element;

    // TODO: all targets should implement all interfaces, so this is a hack
    if (_target instanceof DiagramElement) {
      // TODO: Fix access to protected method.
      element = _target._getMainElement();
    } else {
      element = _target.getElement();
    }

    element.addEventListener('contextmenu', this.onContextMenu, false);
    super.detach();
  }
}

export default ContextMenuBehavior;
