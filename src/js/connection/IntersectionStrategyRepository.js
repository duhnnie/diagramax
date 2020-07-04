import StrategyRepository from '../core/StrategyRepository';
import ArcIntersectionStrategy from './strategy/ArcIntersectionStrategy';

// TODO: maybe this enum could use integer values instead of strings.
const PRODUCTS = Object.freeze({
  ARC: 0,
});

const IntersectionStrategyRepository = new StrategyRepository({
  products: {
    [PRODUCTS.ARC]: ArcIntersectionStrategy,
  },
});

export default IntersectionStrategyRepository;
export { PRODUCTS };
