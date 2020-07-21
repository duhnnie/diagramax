import Factory from '../core/Factory';
import KeyboardControlBehavior from './KeyboardControlBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 0,
});

const KeyboardControlBehaviorFactory =  new Factory({
  products: {
    [PRODUCTS.DEFAULT]: KeyboardControlBehavior,
  },
});

export default KeyboardControlBehaviorFactory;
export { PRODUCTS };
