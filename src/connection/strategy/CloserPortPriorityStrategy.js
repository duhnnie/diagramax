import Geometry from '../../utils/Geometry';
import Port, { ORIENTATION as PORT_ORIENTATION, MODE as PORT_MODE } from '../Port';

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
 * @param {Shape} origShape origin shape.
 * @param {Shape} destShape destination shape.
 * @returns {Object}
 */
const CloserPortPriorityStrategy = function CloserPortPriorityStrategy(origShape, destShape) {
  const origBounds = origShape.getBounds();
  const destBounds = destShape.getBounds();
  const origPosition = origShape.getPosition();
  const destPosition = destShape.getPosition();
  const { x: overlapX, y: overlapY } = Geometry.getOverlappedDimensions(origBounds, destBounds);
  const { x: relativeX, y: relativeY } = Geometry.getNormalizedPosition(origPosition, destPosition);
  let origPorts;
  let destPorts;

  if (overlapX === overlapY) {
    if (overlapX) {
      origPorts = getPortPriorityOrder(PORT_ORIENTATION.X, relativeX, relativeY);
      destPorts = getPortPriorityOrder(PORT_ORIENTATION.Y, relativeX, relativeY);
    } else {
      origPorts = getPortPriorityOrder(PORT_ORIENTATION.Y, relativeX, relativeY);
      destPorts = getPortPriorityOrder(PORT_ORIENTATION.X, relativeX * -1, relativeY * -1);
    }
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

  const origPort = origPorts.find((portIndex) => origShape.hasAvailablePortFor(portIndex, PORT_MODE.OUT));
  const destPort = destPorts.find((portIndex) => {
    if (origShape === destShape && portIndex === origPort) return false;

    return destShape.hasAvailablePortFor(portIndex, PORT_MODE.IN);
  });

  return {
    orig: origPort,
    dest: destPort,
  };
};

export default CloserPortPriorityStrategy;
