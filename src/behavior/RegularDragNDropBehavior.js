import DragNDropBehavior from './DragNDropBehavior';

class RegularDragNDropBehavior extends DragNDropBehavior {
  // eslint-disable-next-line class-methods-use-this
  _evaluate(diffX, diffY) {
    return {
      diffX,
      diffY,
    };
  }
}

export default RegularDragNDropBehavior;
