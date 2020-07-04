class Model {
  constructor(data = null) {
    this._attributes = new Map();

    if (data) {
      this.set(data);
    }
  }

  set(...args) {
    if (typeof args[0] === 'object') {
      Object.entries(args).forEach(([key, value]) => this._attributes.set(key, value));
    } else {
      this._attributes.set(...args);
    }

    return this;
  }

  get(key) {
    return this._attributes.get(key);
  }

  has(key) {
    return this._attributes.has(key);
  }

  delete(key) {
    return this._attributes.delete(key);
  }

  clear() {
    this._attributes.clear();
  }

  toJSON() {
    const json = {};

    this._attributes.forEach((value, key) => {
      json[key] = value;
    }, json);

    return json;
  }
}

export default Model;
