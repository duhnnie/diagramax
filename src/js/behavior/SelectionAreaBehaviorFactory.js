import Factory from "../core/Factory";
import SelectionAreaBehavior from "./SelectionAreaBehavior";

const PRODUCTS = Object.freeze({
  DEFAULT: 0,
});

const SelectionAreaBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: SelectionAreaBehavior,
  },
});

export default SelectionAreaBehaviorFactory;
export { PRODUCTS };
