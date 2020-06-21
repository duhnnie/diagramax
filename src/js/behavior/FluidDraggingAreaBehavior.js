import DraggingAreaBehavior from './DraggingAreaBehavior';

class FluidDraggingAreaBehavior extends DraggingAreaBehavior {
  // eslint-disable-next-line class-methods-use-this
  evaluate(diffX, diffY) {
    return {
      x: diffX,
      y: diffY,
    };
  }
}

export default FluidDraggingAreaBehavior;
