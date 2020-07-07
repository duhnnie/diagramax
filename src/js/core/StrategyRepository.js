import Repository from './Repository';
import ErrorThrower from '../utils/ErrorThrower';

class StrategyRepository extends Repository {
  get(key) {
    if (!this._products[key]) {
      ErrorThrower.custom(`Strategy '${key}' is not registered.`);
    }

    return this._products[key];
  }
}

export default StrategyRepository;
