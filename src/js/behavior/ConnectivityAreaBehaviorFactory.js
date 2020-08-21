import Factory from '../core/Factory';
import ConnectivityAreaBehavior from './ConnectivityAreaBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 0,
});

const ConnectivityAreaBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: ConnectivityAreaBehavior,
  },
});

export default ConnectivityAreaBehaviorFactory;
export { PRODUCTS };
