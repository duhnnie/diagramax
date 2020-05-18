import Geometry from '../../utils/Geometry';
import Port, { ORIENTATION as PORT_ORIENTATION, MODE as PORT_MODE } from '../Port';
import Shape from '../../shape/Shape';

/**
 * Returns and array with the port indexes sorted in priority order for elegibility based on a
 * primary orientation.
 * @param {Number} mainOrientation The orientation index that will be the assumed as the
 * prioritized one.
 * @param {Number} relativeX The relative position of origin respects destination in x axis.
 * @param {Number} relativeY The relative position of origin respects destination in y axis.
 * @returns {Array}
 */
function getPortPriorityOrder(mainOrientation, relativeX, relativeY) {
  const crossOrientation = mainOrientation === PORT_ORIENTATION.X
    ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X;
  const mainPorts = Port.getPriority(mainOrientation, mainOrientation === PORT_ORIENTATION.X
    ? relativeX : relativeY);
  const crossPorts = Port.getPriority(crossOrientation, crossOrientation === PORT_ORIENTATION.X
    ? relativeX : relativeY);

  mainPorts.splice(1, 0, ...crossPorts);

  return mainPorts;
}

/**
 * Returns the ports in an array ordered by priority for each origin and destination shapes.
 * @param {Shape|Port} orig origin shape.
 * @param {Shape|Port} dest destination shape.
 * @returns {Object}
 */
const CloserPortPriorityStrategy = function CloserPortPriorityStrategy(orig, dest) {
  if (orig instanceof Port && dest instanceof Port) return { orig, dest };

  const origIsShape = orig instanceof Shape;
  const destIsShape = dest instanceof Shape;
  const origPosition = origIsShape ? orig.getPosition() : orig.getDescription().point;
  const destPosition = destIsShape ? dest.getPosition() : dest.getDescription().point;
  const { x: relativeX, y: relativeY } = Geometry.getNormalizedPosition(origPosition, destPosition);
  let overlapX = false;
  let overlapY = false;
  let origPorts;
  let destPorts;

  if (origIsShape && destIsShape) {
    const origBounds = orig.getBounds();
    const destBounds = dest.getBounds();
    const overlap = Geometry.getOverlappedDimensions(origBounds, destBounds);

    overlapX = overlap.x;
    overlapY = overlap.y;
  }

  if (overlapX && overlapY) {
    origPorts = getPortPriorityOrder(PORT_ORIENTATION.X, relativeX, relativeY);
    destPorts = getPortPriorityOrder(PORT_ORIENTATION.Y, relativeX, relativeY);
  } else if (overlapX === overlapY) {
    origPorts = getPortPriorityOrder(PORT_ORIENTATION.Y, relativeX, relativeY);
    destPorts = getPortPriorityOrder(PORT_ORIENTATION.X, relativeX * -1, relativeY * -1);
  } else {
    let orientation;

    if (relativeX === 0) {
      orientation = PORT_ORIENTATION.Y;
    } else if (relativeY === 0) {
      orientation = PORT_ORIENTATION.X;
    } else {
      orientation = overlapX ? PORT_ORIENTATION.Y : PORT_ORIENTATION.X;
    }

    origPorts = getPortPriorityOrder(orientation, relativeX, relativeY);
    destPorts = getPortPriorityOrder(orientation, relativeX * -1, relativeY * -1);
  }

  const origPort = origPorts.find((portIndex) => orig.hasAvailablePortFor(portIndex, PORT_MODE.OUT));
  const destPort = destPorts.find((portIndex) => {
    if (orig === dest && portIndex === origPort) return false;

    return dest.hasAvailablePortFor(portIndex, PORT_MODE.IN);
  });

  return {
    orig: origPort,
    dest: destPort,
  };
};

export default CloserPortPriorityStrategy;
