const ArcVertexStrategy = function arcVertexStrategy(start, middle, end) {
  return `Q ${middle.x} ${middle.y} ${end.x} ${end.y}`;
};

export default ArcVertexStrategy;
