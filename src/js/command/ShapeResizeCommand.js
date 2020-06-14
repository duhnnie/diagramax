import Command from './Command';
import { DIRECTION } from '../behavior/ResizeBehavior';

class ShapeResizeCommand extends Command {
  constructor(receiver, { width, height }, direction = null) {
    super(receiver);

    let { x, y } = receiver.getPosition();
    const currentSize = receiver.getSize();
    const diffX = (width - currentSize.width) / 2;
    const diffY = (height - currentSize.height) / 2;

    switch (direction) {
      case DIRECTION.E:
      case DIRECTION.NE:
      case DIRECTION.SE:
        x += diffX;
        break;
      case DIRECTION.W:
      case DIRECTION.NW:
      case DIRECTION.SW:
        x -= diffX;
        break;
      default:
    }

    switch (direction) {
      case DIRECTION.N:
      case DIRECTION.NW:
      case DIRECTION.NE:
        y -= diffY;
        break;
      case DIRECTION.S:
      case DIRECTION.SW:
      case DIRECTION.SE:
        y += diffY;
        break;
      default:
    }

    this._before = {
      position: receiver.getPosition(),
      size: currentSize,
    };

    this._after = {
      position: { x, y },
      size: { width, height },
    };
  }

  execute() {
    this._receiver.setPosition(this._after.position);
    this._receiver.setSize(this._after.size);
  }

  undo() {
    this._receiver.setPosition(this._before.position);
    this._receiver.setSize(this._before.size);
  }
}

export default ShapeResizeCommand;
