import Factory from '../core/Factory';
import ResizeBehavior from './ResizeBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 'default',
});

const ResizeBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: ResizeBehavior,
  },
});

export default ResizeBehaviorFactory;
export { PRODUCTS };
