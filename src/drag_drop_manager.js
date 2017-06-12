class DragAndDropManager {
    constructor(canvas) {
        this._canvas = canvas;
        this._target = null;
        this._fromTarget = null;
        this._diff = null;
        this._registry = {};
        this._dom = {};

        this._init();
    }

    _getShape(element) {
        return this._registry[element.id];
    }

    registerShape(shape) {
        this._registry[shape._id] = shape;
        return this;
    }

    _init() {
        let diff,
            dragged = false;

        $(this._canvas.getHTML())
            .on('mousemove', (e) => {
                if (this._target) {
                    this._target.setPosition(e.offsetX - diff.x, e.offsetY - diff.y);
                    this._fromTarget = null;
                    dragged = true;
                } else if (this._fromTarget) {
                    this._dom.line.setAttribute("x1", this._fromTarget.getX());
                    this._dom.line.setAttribute("y1", this._fromTarget.getY());
                    this._dom.line.setAttribute("x2", e.offsetX - 1);
                    this._dom.line.setAttribute("y2", e.offsetY - 1);
                }
            }).on('mouseleave',  () => {
                let html;

                if (!this._target) return;

                html = this._target.getHTML();
                this._target.setPosition(html.getCTM().e, html.getCTM().f);
                this._target = null;
            }).on('mousedown', '.shape', (e) => {
                this._target = this._getShape(e.currentTarget);
                diff = {
                    x: e.offsetX - this._target.getX(),
                    y: e.offsetY - this._target.getY()
                };
                dragged = false;
            }).on('mouseup', '.shape', (e) => {
                console.log("up");
            }).on('click', '.shape', (e) => {
                if (!dragged){
                    if (this._fromTarget) {
                        this._canvas.connect(this._fromTarget.getID(), this._getShape(e.currentTarget).getID());
                        this._dom.line.setAttribute("stroke", "");
                    } else {
                        this._dom.line.setAttribute("x1", 0);
                        this._dom.line.setAttribute("y1", 0);
                        this._dom.line.setAttribute("x2", 0);
                        this._dom.line.setAttribute("y2", 0);
                        this._dom.line.setAttribute("stroke", "black");
                        this._canvas._dom.container.appendChild(this._dom.line);
                    }
                    this._fromTarget = this._fromTarget ? null : this._getShape(e.currentTarget);
                }

                if (this._target){
                    this._target = null;
                }
                dragged = false;
                e.stopPropagation();
            }).on('click', () => {
                this._dom.line.setAttribute("stroke", "");
            }).on('dblclick', '.shape', e => {
                let shape = this._getShape(e.currentTarget);
                this._canvas._onSelectShape(shape);
            });

        this._dom.line = SVGFactory.create('line');

        return this;
    }
}