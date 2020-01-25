import Element from '../core/Element';
import Canvas from '../canvas/Canvas';

class Component extends Element {
  constructor(settings) {
    super(settings);
    this._canvas = null;
    this._text = null;
    this._dom = {};

    settings = jQuery.extend({
      canvas: null,
      text: '',
    }, settings);

    this.setText(settings.text)
      .setCanvas(settings.canvas);
  }

  // TODO: make this method internal.
  setCanvas(canvas) {
    let oldCanvas;

    if (!(canvas === null || canvas instanceof Canvas)) {
      throw new Error('setCanvas(): Invalid parameter.');
    }

    if (this._canvas !== canvas) {
      if (this._canvas) {
        this.removeFromCanvas();
      }
      this._canvas = canvas;
      canvas.addElement(this);
    }

    return this;
  }

  removeFromCanvas() {
    const oldCanvas = this._canvas;

    if (oldCanvas) {
      this._canvas = null;
      oldCanvas.removeElement(this);
      $(this._html).remove();
    }

    return this;
  }

  getCanvas() {
    return this._canvas;
  }

  setText(text) {
    this._text = text.toString();

    if (this._html) {
      this._dom.text.textContent = text;
      this._dom.title.textContent = text;
    }

    return this;
  }

  getText(text) {
    return this._text;
  }

  trigger(eventName, ...args) {
    const canvas = this._canvas;

    if (canvas) {
      canvas.dispatchEvent(eventName, this, ...args);
    }

    return this;
  }

  getBounds() { throw new Error('getBounds() should be implemented.'); }

  _createHTML() {
    let wrapper;
    let title;
    let text;
    let tspan;

    if (this._html) {
      return this;
    }

    wrapper = Element.createSVG('g');

    title = Element.create('title');
    text = Element.createSVG('text');
    tspan = Element.createSVG('tspan');
    tspan.style.pointerEvents = 'none';

    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('y', '0.5em');

    text.appendChild(tspan);
    wrapper.appendChild(title);
    wrapper.appendChild(text);

    this._dom.title = title;
    this._dom.text = tspan;
    this._dom.textContent = text;

    this._html = wrapper;

    if (this._dom.shapeElement) {
      this._dom.shapeElement.setAttribute('cursor', 'pointer');
    }

    return this.setText(this._text)
      .setID(this._id);
  }
}


export default Component;
