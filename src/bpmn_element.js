class BPMNElement extends Element {
    constructor(settings) {
        super(settings);
        this._canvas = null;
        this._text = null;
        this._dom = {};

        settings = jQuery.extend({
            canvas: null,
            text: ""
        }, settings);

        this.setCanvas(settings.canvas)
            .setText(settings.text);
    }

    // TODO: make this method internal.
    setCanvas(canvas) {
        if (!(canvas === null || canvas instanceof Canvas)) {
            throw new Error('setCanvas(): Invalid parameter.');
        }
        this._canvas = canvas;

        return this;
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
}
