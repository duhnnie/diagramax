import StrategyRepository from '../core/StrategyRepository';
import RectWaypointRepository from './strategy/RectWaypointStrategy';

// TODO: maybe this enum could use integer values instead of strings.
const PRODUCTS = Object.freeze({
  RECT: 0,
});

const WaypointStrategyRepository = new StrategyRepository({
  products: {
    [PRODUCTS.RECT]: RectWaypointRepository,
  },
});

export default WaypointStrategyRepository;
export { PRODUCTS };
