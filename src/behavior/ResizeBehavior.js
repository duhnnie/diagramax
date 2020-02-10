import _ from 'lodash';
import Behavior from './Behavior';
import Element from '../core/Element';

const DEFAULTS = Object.freeze({
  controlOffset: 0.58,
});

class ResizeBehavior extends Behavior {
  constructor(target, options) {
    super(target, options);

    options = _.merge({}, DEFAULTS, options);

    this._controlsContainer = null;
    this._controlOffset = options.controlOffset;
  }

  _createControls() {
    const controlsContainer = Element.createSVG('g');
    const resizeControl = Element.createSVG('circle');
    const { width: targetWidth, height: targetHeight } = this._target.getSize();
    const horizontalOffset = targetWidth * this._controlOffset;
    const verticalOffset = targetHeight * this._controlOffset;
    const horizontalPositions = [-horizontalOffset, 0, horizontalOffset];

    resizeControl.setAttribute('r', 4);
    resizeControl.setAttribute('fill', 'green');

    [-verticalOffset, 0, verticalOffset].forEach((verticalPosition) => {
      horizontalPositions.forEach((horizontalPosition) => {
        if (verticalPosition === 0 && horizontalPosition === 0) return;
        const control = resizeControl.cloneNode(true);

        control.setAttribute('cx', horizontalPosition);
        control.setAttribute('cy', verticalPosition);
        controlsContainer.appendChild(control);
      });
    });

    this._controlsContainer = controlsContainer;
  }

  showControls() {
    if (!this._controlsContainer) this._createControls();

    this._target.getHTML().appendChild(this._controlsContainer);
  }

  hideControls() {
    this._controlsContainer.remove();
  }

  attachBehavior() {
    this._target.getHTML().addEventListener('mouseenter', () => {
      this.showControls();
    }, false);
    this._target.getHTML().addEventListener('mouseleave', () => {
      this.hideControls();
    }, false);
  }
}

export default ResizeBehavior;
