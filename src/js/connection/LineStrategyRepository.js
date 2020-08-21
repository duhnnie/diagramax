import StrategyRepository from '../core/StrategyRepository';
import StraightLineStrategy from './strategy/StraightLineStrategy';

// TODO: maybe this enum could use integer values instead of strings.
const PRODUCTS = Object.freeze({
  STRAIGHT: 0,
});

const LineStrategyRepository = new StrategyRepository({
  products: {
    [PRODUCTS.STRAIGHT]: StraightLineStrategy,
  },
});

export default LineStrategyRepository;
export { PRODUCTS };
