import Factory from '../core/Factory';
import ShapePositioningCommand from './ShapePositioningCommand';
import ShapeTextCommand from './ShapeTextCommand';
import ShapeResizeCommand from './ShapeResizeCommand';
import ShapeRemoveCommand from './ShapeRemoveCommand';
import ShapeAddCommand from './ShapeAddCommand';
import ConnectionRemoveCommand from './ConnectionRemoveCommand';
import ConnectCommand from './ConnectCommand';

const PRODUCTS = Object.freeze({
  SHAPE_ADD: 0,
  SHAPE_TEXT: 1,
  SHAPE_POSITION: 2,
  SHAPE_RESIZE: 3,
  SHAPE_REMOVE: 4,
  CONNECT: 5,
  CONNECTION_REMOVE: 6,
});

const CommandFactory = new Factory({
  products: {
    [PRODUCTS.SHAPE_ADD]: ShapeAddCommand,
    [PRODUCTS.SHAPE_TEXT]: ShapeTextCommand,
    [PRODUCTS.SHAPE_POSITION]: ShapePositioningCommand,
    [PRODUCTS.SHAPE_RESIZE]: ShapeResizeCommand,
    [PRODUCTS.SHAPE_REMOVE]: ShapeRemoveCommand,
    [PRODUCTS.CONNECT]: ConnectCommand,
    [PRODUCTS.CONNECTION_REMOVE]: ConnectionRemoveCommand,
  },
});

export default CommandFactory;
export { PRODUCTS };
