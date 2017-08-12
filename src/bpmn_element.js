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
        let canvas = this._canvas;

        if (canvas) {
            canvas.dispatchEvent(eventName, this, ...args);
        }

        return this;
    }

    _createHTML() {
        let wrapper,
            title,
            text,
            tspan;

        if (this._html) {
            return this;
        }

        wrapper = SVGFactory.create('g');

        title = document.createElement('title');
        text = SVGFactory.create('text');
        tspan = SVGFactory.create('tspan');
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
            this._dom.shapeElement.setAttribute("cursor", "pointer");
        }

        return this.setText(this._text)
                .setID(this._id);
    }
}
