import Factory from '../core/Factory';
import ConnectivityBehavior from './ConnectivityBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 'default',
});

const ConnectivityBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: ConnectivityBehavior,
  },
});

export default ConnectivityBehaviorFactory;
export { PRODUCTS };
