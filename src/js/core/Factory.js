import Repository from './Repository';

class Factory extends Repository {
  create(key, ...args) {
    if (!this._products[key]) {
      throw new Error(`create(): product '${key}' is not registered.`);
    }

    const Klass = this._products[key];

    return new Klass(...args);
  }
}

export default Factory;
