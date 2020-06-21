import Repository from './Repository';

class StrategyRepository extends Repository {
  get(key) {
    if (!this._products[key]) {
      throw new Error(`get(): strategy '${key}' is not registered.`);
    }

    return this._products[key];
  }
}

export default StrategyRepository;
