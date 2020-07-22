import Factory from "../core/Factory";
import ContextMenuBehavior from "./ContextMenuBehavior";

const PRODUCTS = Object.freeze({
  DEFAULT: 0,
})

const ContextMenuBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: ContextMenuBehavior,
  },
});

export default ContextMenuBehaviorFactory;
export { PRODUCTS };
