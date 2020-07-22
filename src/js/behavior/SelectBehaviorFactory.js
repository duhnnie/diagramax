import Factory from '../core/Factory';
import SelectBehavior from './SelectBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 'default',
});

const SelectBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: SelectBehavior,
  },
});

export default SelectBehaviorFactory;
export { PRODUCTS };
