class BPMNProject extends Element {
    constructor(settings) {
        super(settings);
        this._canvas = null;
        this._name = null;

        settings = $.extend({
            onSelectShape: null,
            name: ''
        }, settings);

        this.setName(settings.name);
        this._canvas = new Canvas({
            id: settings.id,
            width: 14000,
            height: 14000,
            onSelectShape: settings.onSelectShape
        });
    }

    setName(name) {
        this._name = name;
        return this;
    }

    _createHTML() {
        let html = document.createElement('div');

        html.id = this._id;
        html.className = "bpmn-project";

        html.appendChild(this._canvas.getHTML());

        this._html = html;
        return this;
    }
}