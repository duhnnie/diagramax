import StrategyRepository from '../core/StrategyRepository';
import CloserPortPriorityStrategy from './strategy/CloserPortPriorityStrategy';

const PRODUCTS = Object.freeze({
  CLOSER: 'closer',
});

const PortPriorityStrategyRepository = new StrategyRepository({
  products: {
    [PRODUCTS.CLOSER]: CloserPortPriorityStrategy,
  },
});

export default PortPriorityStrategyRepository;
export { PRODUCTS };
