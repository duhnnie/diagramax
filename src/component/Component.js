import Element from '../core/Element';
import Canvas from '../canvas/Canvas';
import ShapeText from '../shape/ShapeText';

class Component extends Element {
  constructor(settings) {
    super(settings);
    this._canvas = null;
    this._text = new ShapeText();
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
    this._text.setText(text);

    if (this._dom.title) {
      this._dom.title.text = text;
    }

    return this;
  }

  getText() {
    return this._text.getText();
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
    if (this._html) {
      return this;
    }

    const wrapper = Element.createSVG('g');
    const title = Element.create('title');

    title.textContent = this._text.getText();
    wrapper.appendChild(title);
    wrapper.appendChild(this._text.getHTML());

    this._dom.title = title;

    this._html = wrapper;

    if (this._dom.shapeElement) {
      this._dom.shapeElement.setAttribute('cursor', 'pointer');
    }

    return this.setID(this._id);
  }
}


export default Component;
