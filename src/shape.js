class BPMNShape extends BPMNElement {
    constructor(settings) {
        super(settings);
        this._width = null;
        this._height = null;
        this._x = null;
        this._y = null;
        this._connections = new Set();

        settings = jQuery.extend({
            position: {
                x: 0,
                y: 0
            }
        }, settings);

        this.setPosition(settings.position.x, settings.position.y)
            .setSize(settings.width, settings.height);
    }

    setX(x) {
        if (typeof x !== 'number') {
            throw new Error('setX(): invalid parameter.');
        }

        this._x = x;

        if (this._html) {
            this._html.setAttribute('transform', `translate(${x}, ${this._y})`);
        }

        return this;
    }

    getX() {
        return this._x;
    }

    setY(y) {
        if (typeof y !== 'number') {
            throw new Error('setY(): invalid parameter.');
        }
        this._y = y;

        if (this._html) {
            this._html.setAttribute('transform', `translate(${this._x}, ${y})`);
        }

        return this;
    }

    getY() {
        return this._y;
    }

    setPosition(x, y) {
        return this.setX(x)
            .setY(y);
    }

    getPosition() {
        return {
            x: this._x,
            y: this._y
        };
    }

    setWidth(width) {
        if (typeof width !== 'number') {
            throw new Error('setWidth(): invalid parameter.');
        }
        this._width = width;
        return this;
    }

    getWidth() {
        return this._width;
    }

    setHeight(height) {
        if (typeof height !== 'number') {
            throw new Error('setHeight(): invalid parameter.');
        }
        this._height = height;
    }

    getHeight() {
        return this._height;
    }

    setSize(width, height) {
        return this.setWidth(width)
            .setHeight(height);
    }

    getSize() {
        return {
            width: this._width,
            height: this.height
        };
    }

    getConnectedShapes() {
        let prev = [],
            next = [];

        this._connections.forEach(i => {
            let shape = i.getDestShape();

            if (shape !== this) {
                next.push(shape);
            }

            shape = i.getOrigShape();

            if (shape !== this) {
                prev.push(shape)
            }
        });

        return {
            prev: prev,
            next: next
        };
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
        wrapper.setAttribute('transform', `translate(${this._x}, ${this._y})`);
        wrapper.setAttribute('class', 'shape');

        title = document.createElement('title');
        text = SVGFactory.create('text');
        tspan = SVGFactory.create('tspan');

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