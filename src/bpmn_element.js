class BPMNElement extends Element {
    constructor(settings) {
        super(settings);
        this._text = null;
        this._dom = {};

        settings = jQuery.extend({
            text: ""
        }, settings);

        this.setText(settings.text);
    }

    setText(text) {
        this._text = text.toString();

        if (this._html) {
            this._dom.text.textContent = text;
            this._dom.title.textContent = text;
        }

        return this;
    }
}