import Element from '../core/Element';
import BPMNShape from '../shape/Shape';

class StartEvent extends BPMNShape {
  setWidth() {
    this._width = 40;
    return this;
  }

  setHeight() {
    this._height = 40;
    return this;
  }

  _createHTML() {
    let circle;

    if (this._html) {
      return this;
    }

    circle = Element.createSVG('circle');

    circle.setAttribute('fill', '#B4DCCB');
    circle.setAttribute('stroke', '#01894E');
    circle.setAttribute('r', this._width / 2);
    circle.setAttribute('cx', this._width / 2);
    circle.setAttribute('cy', this._height / 2);
    circle.setAttribute('stroke-width', '4');
    circle.setAttribute('stroke-dasharray', '0');
    circle.setAttribute('transform', `translate(-${this._width / 2}, -${this._height / 2})`);

    super._createHTML();

    this._dom.textContent.setAttribute('transform', 'translate(0, 30)');
    this._dom.shapeElement = circle;

    this._html.insertBefore(circle, this._dom.title);

    return this;
  }
}

export default StartEvent;