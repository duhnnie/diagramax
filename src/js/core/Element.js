import uuid from 'uuid/v1';

class Element {
  static create(tag = 'div') {
    return document.createElement(tag);
  }

  static createSVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
  }

  constructor(settings) {
    this._id = null;
    this._html = null;

    settings = {
      id: uuid(),
      ...settings,
    };

    this.setID(settings.id);
  }

  setID(id) {
    this._id = id;

    if (this._html) {
      this._html.setAttribute('id', id);
    }

    return this;
  }

  getID() {
    return this._id;
  }

  trigger() { return this; }

  _createHTML() { return this; }

  getHTML() {
    if (!this._html) {
      this._createHTML();
    }
    return this._html;
  }

  remove() {
    if (this._html) {
      this._html.remove();
      this._html = null;
    }
  }
}

export default Element;
