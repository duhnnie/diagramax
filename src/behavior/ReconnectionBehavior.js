import Behavior from './Behavior';

class ReconnectionBehavior extends Behavior {
  constructor(target, settings) {
    super(target, settings);

    this.dom = {};
  }

  _updateHandlers() {
    debugger;
  }

  attachBehavior() {
    this._updateHandlers();
  }
}

export default ReconnectionBehavior;
