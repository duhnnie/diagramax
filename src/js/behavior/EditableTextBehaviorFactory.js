import Factory from '../core/Factory';
import EditableTextBehavior from './EditableTextBehavior';

const PRODUCTS = Object.freeze({
  DEFAULT: 'default',
});

const EditableTextBehaviorFactory = new Factory({
  products: {
    [PRODUCTS.DEFAULT]: EditableTextBehavior,
  },
});

export default EditableTextBehaviorFactory;
export { PRODUCTS };
