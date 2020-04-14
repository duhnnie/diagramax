const DEFAULTS = Object.freeze({
  products: {},
});

class Repository {
  constructor(settings) {
    settings = { ...DEFAULTS, ...settings };

    this._products = {};

    this.setProducts(settings.products);
  }

  addProduct(key, Klass) {
    if (this._products[key]) {
      throw new Error('addProduct(): product key already exists, use another key.');
    }

    this._products[key] = Klass;
  }

  setProducts(products) {
    const productsArray = Object.entries(products || {});

    if (!productsArray.length) {
      throw new Error('setProducts(): At least one product should be produced by this repository.');
    }

    productsArray.forEach(([key, Klass]) => {
      this.addProduct(key, Klass);
    });
  }
}

export default Repository;
