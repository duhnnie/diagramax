import Factory from '../core/Factory';
import Circle from '../shape/Circle';
import Ellipse from '../shape/Ellipse';
import Triangle from '../shape/Triangle';
import Rectangle from '../shape/Rectangle';
import Connection from '../connection/Connection';

const PRODUCTS = Object.freeze({
  CIRCLE: Circle.type,
  ELLIPSE: Ellipse.type,
  TRIANGLE: Triangle.type,
  RECTANGLE: Rectangle.type,
  CONNECTION: Connection.type,
});

const ShapeFactory = new Factory({
  products: {
    [PRODUCTS.CIRCLE]: Circle,
    [PRODUCTS.ELLIPSE]: Ellipse,
    [PRODUCTS.TRIANGLE]: Triangle,
    [PRODUCTS.RECTANGLE]: Rectangle,
    [PRODUCTS.CONNECTION]: Connection,
  },
});

export default ShapeFactory;
export { PRODUCTS };
