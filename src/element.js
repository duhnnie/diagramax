class Element {
    constructor(settings) {
        this._id = null;
        this._html = null;

        settings = $.extend({
            id: generateUniqueId()
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

    _createHTML() {}

    getHTML() {
        if (!this._html) {
            this._createHTML();
        }
        return this._html;
    }
}