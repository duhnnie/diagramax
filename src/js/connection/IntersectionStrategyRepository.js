import StrategyRepository from '../core/StrategyRepository';
import ArcIntersectionStrategy from './strategy/ArcIntersectionStrategy';

// TODO: maybe this enum could use integer values instead of strings.
const PRODUCTS = Object.freeze({
  ARC: 'arc',
});

const IntersectionStrategyRepository = new StrategyRepository({
  products: {
    [PRODUCTS.ARC]: ArcIntersectionStrategy,
  },
});

export default IntersectionStrategyRepository;
export { PRODUCTS };
