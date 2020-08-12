import Canvas from './diagram/Canvas';
import Rectangle from './shape/Rectangle';
import Circle from './shape/Circle';
import Triangle from './shape/Triangle';
import Ellipse from './shape/Ellipse';
import { PRODUCTS as COMMANDS } from './command/CommandFactory';

// eslint-disable-next-line no-undef
const VERSION = __VERSION__;

export {
  Canvas,
  Rectangle,
  Circle,
  Triangle,
  Ellipse,
  COMMANDS,
  VERSION,
};
