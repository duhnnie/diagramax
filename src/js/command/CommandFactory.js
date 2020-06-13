import Factory from '../core/Factory';
import ShapePositioningCommand from './ShapePositioningCommand';
import ShapeTextCommand from './ShapeTextCommand';
import ShapeResizeCommand from './ShapeResizeCommand';
import ShapeRemoveCommand from './ShapeRemoveCommand';
import ShapeAddCommand from './ShapeAddCommand';
import ConnectionRemoveCommand from './ConnectionRemoveCommand';
import ConnectCommand from './ConnectCommand';

const PRODUCTS = Object.freeze({
  SHAPE_ADD: 'shape_add',
  SHAPE_TEXT: 'shape_text',
  SHAPE_POSITION: 'shape_position',
  SHAPE_RESIZE: 'shape_resize',
  SHAPE_REMOVE: 'shape_remove',
  CONNECT: 'connect',
  CONNECTION_REMOVE: 'connection_remove',
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
