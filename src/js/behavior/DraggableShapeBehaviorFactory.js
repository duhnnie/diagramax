import Factory from '../core/Factory';
import DraggableShapeBehavior from './DraggableShapeBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 'default',
});

const DraggableShapeBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: DraggableShapeBehavior,
  },
});

export default DraggableShapeBehaviorFactory;
export { PRODUCTS };
