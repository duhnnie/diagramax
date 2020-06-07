import Factory from '../core/Factory';
import ShapePositioningCommand from './ShapePositioningCommand';
import ShapeTextCommand from './ShapeTextCommand';
import ShapeResizeCommand from './ShapeResizeCommand';

const PRODUCTS = Object.freeze({
  SHAPE_POSITION: 'shape_position',
  SHAPE_TEXT: 'shape_text',
  SHAPE_RESIZE: 'shape_resize',
});

const CommandFactory = new Factory({
  products: {
    [PRODUCTS.SHAPE_POSITION]: ShapePositioningCommand,
    [PRODUCTS.SHAPE_TEXT]: ShapeTextCommand,
    [PRODUCTS.SHAPE_RESIZE]: ShapeResizeCommand,
  },
});

export default CommandFactory;
export { PRODUCTS };
