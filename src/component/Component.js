import Element from '../core/Element';
import Canvas from '../canvas/Canvas';
import ShapeText from '../shape/components/ShapeText';
import { stopPropagation } from '../canvas/EventBus';

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

  _getMainElement() {
    return this._createHTML()._dom.mainElement;
  }

  getBounds() { throw new Error('getBounds() should be implemented.'); }

  _setEventWall() {
    this._html.addEventListener('click', stopPropagation, false);
    this._html.addEventListener('dblClick', stopPropagation, false);
  }

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

    if (this._dom.mainElement) {
      // TODO: This can be set in CSS?
      this._dom.mainElement.setAttribute('cursor', 'pointer');
    }

    this._setEventWall();

    return this.setID(this._id);
  }
}


export default Component;
