import Repository from './Repository';

class Factory extends Repository {
  create(key, args) {
    if (!this._products[key]) {
      throw new Error(`create(): product '${key}' is not registered.`);
    }

    return new this._products[key](...args);
  }
}

export default Factory;
