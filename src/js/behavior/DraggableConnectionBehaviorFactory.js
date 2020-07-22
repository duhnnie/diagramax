import Factory from '../core/Factory';
import DraggableConnectionBehavior from './DraggableConnectionBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 'default',
});


const DraggableConnectionBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: DraggableConnectionBehavior,
  },
});

export default DraggableConnectionBehaviorFactory;
export { PRODUCTS };
