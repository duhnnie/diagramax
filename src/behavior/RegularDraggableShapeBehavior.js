import DraggableShapeBehavior from './DraggableShapeBehavior';

class RegularDraggableShapeBehavior extends DraggableShapeBehavior {
  // eslint-disable-next-line class-methods-use-this
  _evaluate(diffX, diffY) {
    return {
      diffX,
      diffY,
    };
  }
}

export default RegularDraggableShapeBehavior;
