const StraightLineStrategy = function straightLineStrategy(startPoint, endPoint) {
  return `L${endPoint.x} ${endPoint.y}`;
};

export default StraightLineStrategy;
