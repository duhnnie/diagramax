import StrategyRepository from '../core/StrategyRepository';
import RectVertextStrategy from './strategy/RectVertexStrategy';
import ArcVertexStrategy from './strategy/ArcVertextStrategy';

// TODO: maybe this enum could use integer values instead of strings.
const PRODUCTS = Object.freeze({
  RECT: 'rect',
  ARC: 'arc',
});

const VertexStrategyRepository = new StrategyRepository({
  products: {
    [PRODUCTS.RECT]: RectVertextStrategy,
    [PRODUCTS.ARC]: ArcVertexStrategy,
  },
});

export default VertexStrategyRepository;
export { PRODUCTS };
