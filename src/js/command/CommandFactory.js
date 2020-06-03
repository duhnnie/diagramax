import Factory from '../core/Factory';
import ShapePositioningCommand from './ShapePositioningCommand';

const PRODUCTS = Object.freeze({
  SHAPE_POSITION: 'shape_position',
});

const CommandFactory = new Factory({
  products: {
    [PRODUCTS.SHAPE_POSITION]: ShapePositioningCommand,
  },
});

export default CommandFactory;
export { PRODUCTS };
