import Factory from "../core/Factory";
import DraggingAreaBehavior from "./DraggingAreaBehavior";

const PRODUCTS = Object.freeze({
  DEFAULT: 0,
});

const DraggingAreaBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: DraggingAreaBehavior,
  },
});

export default DraggingAreaBehaviorFactory;
export { PRODUCTS };
