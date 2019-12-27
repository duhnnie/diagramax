import StartEvent from './start_event';

class EndEvent extends StartEvent {
  _createHTML() {
    if (this._html) {
      return this;
    }
    super._createHTML();
    this._dom.shapeElement.setAttribute('fill', '#EEC0C0');
    this._dom.shapeElement.setAttribute('stroke', '#C62D2D');

    return this;
  }
}

export default EndEvent;
