import Repository from './Repository';
import ErrorThrower from '../utils/ErrorThrower';

class Factory extends Repository {
  create(key, ...args) {
    if (!this._products[key]) {
      ErrorThrower.custom(`Product '${key}' is not registered.`);
    }

    const Klass = this._products[key];

    return new Klass(...args);
  }

  hasProductKey(key) {
    return !!this._products[key];
  }

  getProductKey(product) {
    let found;

    if (typeof product === 'function') {
      found = Object.entries(this._products).find(([value]) => value === product);
    } else {
      found = Object.entries(this._products).find(([value]) => value.constructor === value);
    }

    return found ? found[0] : null;
  }
}

export default Factory;
