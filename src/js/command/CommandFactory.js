import Factory from '../core/Factory';
import ShapePositioningCommand from './ShapePositioningCommand';
import ShapeTextCommand from './ShapeTextCommand';

const PRODUCTS = Object.freeze({
  SHAPE_POSITION: 'shape_position',
  SHAPE_TEXT: 'shape_text',
});

const CommandFactory = new Factory({
  products: {
    [PRODUCTS.SHAPE_POSITION]: ShapePositioningCommand,
    [PRODUCTS.SHAPE_TEXT]: ShapeTextCommand,
  },
});

export default CommandFactory;
export { PRODUCTS };
