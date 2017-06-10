class StartEvent extends BPMNShape {
    setWidth() {
        this._width = 50;
        return this;
    }

    setHeight() {
        this._height = 50;
        return this;
    }

    _createHTML() {
        let circle;

        if (this._html) {
            return this;
        }

        circle = SVGFactory.create('circle');

        circle.setAttribute("fill", "#B4DCCB");
        circle.setAttribute("stroke", "#01894E");
        circle.setAttribute("r", "20");
        circle.setAttribute("cx", "30");
        circle.setAttribute("cy", "30");
        circle.setAttribute("width", this._width);
        circle.setAttribute("height", this._height);
        circle.setAttribute("stroke-width", "4");
        circle.setAttribute("stroke-dasharray", "0");
        circle.setAttribute("transform", "translate(-30, -30)");

        super._createHTML();

        this._dom.textContent.setAttribute('transform', 'translate(0, 30)');
        this._dom.shapeElement = circle;

        this._html.insertBefore(circle, this._dom.title);

        return this;
    }
}