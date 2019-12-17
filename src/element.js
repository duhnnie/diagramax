import uuid from 'uuid/v1';

class Element {
    constructor(settings) {
        this._id = null;
        this._html = null;

        settings = $.extend({
            id: uuid(),
        }, settings);

        this.setID(settings.id);
    }

    setID(id) {
        this._id = id;

        if (this._html) {
            this._html.setAttribute("id", id);
        }

        return this;
    }

    getID() {
        return this._id;
    }

    trigger(eventName, ...args) { return this; }

    _createHTML() { return this; }

    getHTML() {
        if (!this._html) {
            this._createHTML();
        }
        return this._html;
    }
}

export default Element;

