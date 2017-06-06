var BPMNFactory = (function () {
    var bpmn_moddle = new BpmnModdle();

    return {
        create: function (descriptor, attrs) {
            return bpmn_moddle.create(descriptor, attrs);
        },
        fromXML: function (data, callback) {
            return bpmn_moddle.fromXML(data, callback);
        },
        toXML: function (data, callback) {
            return bpmn_moddle.toXML(data, callback);
        }
    };
}());

var Element = function (settings) {
    this._id = null;
    this._html = null;
    Element.prototype._init.call(this, settings);
};

Element.prototype._init = function (settings) {
    settings = $.extend({
        id: generateUniqueId()
    }, settings);

    this.setID(settings.id);
};

Element.prototype.setID = function (id) {
    this._id = id;

    if (this._html) {
        this._html.setAttribute("id", id);
    }

    return this;
};

Element.prototype.getID = function () {
    return this._id;
}

Element.prototype._createHTML = function () {};

Element.prototype.getHTML = function() {
    if (!this._html) {
        this._createHTML();
    }
    return this._html;
};

var Shape = function (settings) {
    Element.call(this, settings);
    this._width = null;
    this._height = null;
    this._position = {};
    this._text = null;
    this._dom = {};
    this._businessObject = {};
    this._connections = [];
    this._processConfiguration = {};
    Shape.prototype._init.call(this, settings);
};

Shape.prototype = new Element();
Shape.prototype.constructor = Shape;

Shape.prototype._init = function(settings) {
    settings = jQuery.extend({
        text: "",
        position: {
            x: 0, 
            y: 0,

        }
    }, settings);

    this.setPosition(settings.position)
        .setText(settings.text)
        .setWidth(settings.width)
        .setHeight(settings.height)
        ._createBusinessObject();
};

Shape.prototype.getConnectedShapes = function () {
    var prev = [],
        next = [];

    this._connections.forEach(i => {
        let destShape = i.getDestShape();
        if (destShape !== this) {
            next.push(destShape);
        } else {
            prev.push(i.getOrigShape());
        }
    });

    return {
        prev: prev,
        next: next
    };
};

Shape.prototype.setProcessConfig = function (key, value) {
    this._processConfiguration[key] = value;
    return this;
};

Shape.prototype.getProcessConfig = function () {
    return this._processConfiguration;
};

Shape.prototype._createBusinessObject = function () {
    var elem,
        bounds;

    if (!this.constructor.bpmnType) {
        return this;
    }

    elem = BPMNFactory.create(this.constructor.bpmnType, {
            id: 'el_' + this._id,
            name: this.getText()
        });

    bounds = BPMNFactory.create("dc:Bounds", {});

    this._businessObject.elem = elem;

    this._businessObject.di = BPMNFactory.create("bpmndi:BPMNShape", {
        bpmnElement: elem,
        bounds: bounds,
        id: 'di_' + elem.id
    });

    this._businessObject.di.bounds.x = this.getX();
    this._businessObject.di.bounds.y = this.getY();
    this._businessObject.di.bounds.width = this.getWidth();
    this._businessObject.di.bounds.height = this.getHeight();

    return this;
};

Shape.prototype.getBusinessObject = function () {
    return this._businessObject;
};

Shape.prototype.setText = function (text) {
    this._text = text.toString();
    if (this._html) {
        this._dom.text.textContent = text;
        this._dom.title.textContent = text;
    }
    return this;
};

Shape.prototype.getText = function () {
    return this._text;
};

Shape.prototype.setX = function (x) {
    this._position.x = x;
    if (this._html) {
        this._html.setAttribute('transform', `translate(${x}, ${this._position.y})`);
    }
    return this;
};

Shape.prototype.getX = function (x) {
    return this._position.x;
};

Shape.prototype.setY = function (y) {
    this._position.y = y;
    if (this._html) {
        this._html.setAttribute('transform', `translate(${this._position.x}, ${y})`);
    }
    return this;
};

Shape.prototype.getY = function (y) {
    return this._position.y;
};

Shape.prototype.setPosition = function (x, y) {
    var x, y;

    if (arguments.length !== 2 && typeof x !== 'object') {
        return this;
    } else if (typeof x === 'object') {
        y = x.y;
        x = x.x;
    }

    this.setX(x);
    this.setY(y);

    return this;
};

Shape.prototype.getPosition = function () {
    return {
        x: this._position.x,
        y: this._position.y
    };
};

Shape.prototype.setWidth = function (width) {
    this._width = width;      
    return this;
};

Shape.prototype.getWidth = function () {
    return this._width;
};

Shape.prototype.setHeight = function (height) {
    this._height = height;
    return this;
};

Shape.prototype.getHeight = function () {
    return this._height;
};

Shape.prototype._postHTMLCreation = function () {
    if (this._dom.shapeElement) {
        this._dom.shapeElement.setAttribute("cursor", "pointer");
    }

    return this;
};

Shape.prototype._createHTML = function() {
    var wrapper, 
        title,
        text,
        tspan;

    if (this._html) {
        return this;
    }

    wrapper = document.createElementNS("http://www.w3.org/2000/svg", 'g');

    wrapper.setAttribute("transform", `translate(${this._position.x}, ${this._position.y})`);
    wrapper.setAttribute("class", "shape");

    title = document.createElement('title');
    text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('y', '1em');

    text.appendChild(tspan);
    wrapper.appendChild(title);
    wrapper.appendChild(text);

    this._dom.title = title;
    this._dom.text = tspan;
    this._dom.textContent = text;

    this._html = wrapper;

    return this.setText(this._text)
        .setID(this._id)
        ._postHTMLCreation();
};

var StartEvent = function (settings) {
    Shape.call(this, settings);
};

StartEvent.prototype = new Shape();
StartEvent.prototype.constructor = StartEvent;
StartEvent.bpmnType = "bpmn:StartEvent";

StartEvent.prototype._createBusinessObject = function () {
    Shape.prototype._createBusinessObject.call(this);
    this._businessObject.eventDefinitions = [];
    return this;
};

StartEvent.prototype.setWidth = function () {
    this._width = 50;
    return this;
};

StartEvent.prototype.setHeight = function () {
    this._height = 50;
    return this;
};

StartEvent.prototype._createHTML = function () {
    var circle;

    if (this._html) {
        return this;
    }

    Shape.prototype._createHTML.call(this);

    circle = document.createElementNS("http://www.w3.org/2000/svg", 'circle');

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

    this._dom.textContent.setAttribute('transform', 'translate(0, 30)');
    this._dom.shapeElement = circle;
    this._html.insertBefore(circle, this._dom.title);

    return this._postHTMLCreation();
};

var EndEvent = function (settings) {
    StartEvent.call(this, settings);
};

EndEvent.prototype = new StartEvent();
EndEvent.prototype.constructor = EndEvent;
EndEvent.bpmnType = "bpmn:EndEvent";

EndEvent.prototype._createHTML = function () {
    if (this._html) {
        return this;
    }
    StartEvent.prototype._createHTML.call(this);
    this._dom.shapeElement.setAttribute("fill", "#EEC0C0");
    this._dom.shapeElement.setAttribute("stroke", "#C62D2D");

    return this;
};

var Activity = function (settings) {
    Shape.call(this, settings);
    Activity.prototype._init.call(this, settings);
};

Activity.prototype = new Shape();
Activity.prototype.constructor = Activity;
Activity.bpmnType = "bpmn:Task";

Activity.prototype._init = function (settings) {
    settings = $.extend({
        width: 150,
        height: 80
    }, settings);

    this.setWidth(settings.width)
        .setHeight(settings.height);
};

Activity.prototype._createHTML = function () {
    var rect;

    if (this._html) {
        return this;
    }

    Shape.prototype._createHTML.call(this);

    rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute("fill", "#ffffff");
    rect.setAttribute("stroke", "#000000");
    rect.setAttribute("width", this._width);
    rect.setAttribute("height", this._height);
    rect.setAttribute("rx", 4);
    rect.setAttribute("ry", 4);
    rect.setAttribute("stroke-width", 4);
    rect.setAttribute("stroke-dasharray", 0);
    rect.setAttribute("transform", `translate(${this._width / -2}, ${this._height / -2})`);

    this._dom.textContent.setAttribute('y', '0.3em');
    this._dom.text.setAttribute('transform', 'translate(0, 0)');
    this._dom.shapeElement = rect;

    this._html.insertBefore(rect, this._dom.title);

    return this._postHTMLCreation();
};

var Connection = function (settings) {
    Element.call(this, settings);
    this._origShape = null;
    this._destShape = null;
    this._dom = {};
    this._businessObject = {};
    this._points = [];
    Connection.prototype._init.call(this, settings);
};

Connection.prototype = new Element();
Connection.prototype.constructor = Connection;
Connection.bpmnType = "bpmn:SequenceFlow";

Connection.prototype._init = function (settings) {
    settings = $.extend({
        origShape: null, 
        destShape: null
    }, settings);

    this._origShape = settings.origShape;
    this._destShape = settings.destShape;

    if (this._origShape) {
        this._origShape._connections.push(this);
    }
    if (this._destShape) {
        this._destShape._connections.push(this);
    }
    this._createBusinessObject();
};

Connection.prototype.getOrigShape = function () {
    return this._origShape;
};

Connection.prototype.getDestShape = function () {
    return this._destShape;
};

Connection.prototype._updateBPMNConnections = function () {
    var inverseSet = this._businessObject.$instanceOf('bpmn:SequenceFlow'),
        businessObject = this._businessObject,
        sourceBusinessObject = this._origShape.getBusinessObject(),
        targetBusinessObject = this._destShape.getBusinessObject();

    if (businessObject.sourceRef !== sourceBusinessObject.elem) {
        if (inverseSet) {
            CollectionRemove(businessObject.sourceRef && businessObject.sourceRef.get('outgoing'), businessObject);
            if (sourceBusinessObject.elem) {
                sourceBusinessObject.elem.get('outgoing').push(businessObject);
            }
        }
        businessObject.sourceRef = sourceBusinessObject.elem;
    }

    if (businessObject.targetRef !== targetBusinessObject.elem) {
        if (inverseSet) {
            CollectionRemove(businessObject.targetRef && businessObject.targetRef.get('incoming'), businessObject);
            if (targetBusinessObject.elem) {
                targetBusinessObject.elem.get('incoming').push(businessObject);
            }
        }
        businessObject.targetRef = targetBusinessObject.elem;
    }

    return this;
};

Connection.prototype._updateBPMNWaypoint = function () {
    this._businessObject.di.set('waypoint', _.map(this._points, i => BPMNFactory.create('dc:Point', {
        x: i.x,
        y: i.y
    })));
};

Connection.prototype._createBusinessObject = function () {
    var obj;

    if (!this.constructor.bpmnType) {
        return this;
    }

    obj = BPMNFactory.create(this.constructor.bpmnType, {
            id: 'flo_' + this._id,
            name: " "
        });

    obj.di = BPMNFactory.create("bpmndi:BPMNEdge", {
            bpmnElement: obj,
            id: obj.id + "_di"
        });

    this._businessObject = obj;

    this._updateBPMNWaypoint();

    return this._updateBPMNConnections();
};

Connection.prototype.getBusinessObject = function () {
    return this._businessObject;
};

Connection.prototype._connect = function () {
    var origPos,
        destPos,
        gapX,
        gapY,
        points = [],
        destPort = {},
        origPort = {},
        dx,
        dy,
        path;

    origPos = this._origShape.getPosition();
    destPos = this._destShape.getPosition();

    gapX = Math.abs(destPos.x - origPos.x);
    gapY = Math.abs(destPos.y - origPos.y);

    if (gapX === 0) {
        if (destPos.y > origPos.y) {
            origPos.y += this._origShape.getHeight() / 2;
            destPos.y -= this._destShape.getHeight() / 2;
        } else {
            origPos.y -= this._origShape.getHeight() / 2;
            destPos.y += this._destShape.getHeight() / 2;
        }

        gapY = Math.abs(destPos.y - origPos.y) / 3;

        points = [
            {
                x: origPos.x,
                y: origPos.y
            },
            {
                x: origPos.x,
                y: origPos.y + (gapY * (destPos.y > origPos.y ? 1 : -1))
            },
            {
                x: origPos.x,
                y: origPos.y + (gapY * (destPos.y > origPos.y ? 2 : -2))
            },
            {
                x: destPos.x,
                y: destPos.y  
            }
        ];

    } else if (gapY === 0) {
        if (destPos.x > origPos.x) {
            origPos.x += this._origShape.getWidth() / 2;
            destPos.x -= this._destShape.getWidth() / 2;
        } else {
            origPos.x -= this._origShape.getWidth() / 2;
            destPos.x += this._destShape.getWidth() / 2;
        }

        gapX = Math.abs(destPos.x - origPos.x) / 3;

        points = [
            {
                x: origPos.x,
                y: origPos.y
            },
            {
                x: origPos.x + (gapX * (destPos.x > origPos.x ? 1 : -1)),
                y: origPos.y
            },
            {
                x: origPos.x + (gapX * (destPos.x > origPos.x ? 2 : -2)),
                y: origPos.y
            },
            {
                x: destPos.x,
                y: destPos.y  
            }
        ];
    } else {
        if (gapY > gapX) {
            if (destPos.y > origPos.y) {
                origPos.y += this._origShape.getHeight() / 2;
                destPos.y -= this._destShape.getHeight() / 2;
            } else {
                origPos.y -= this._origShape.getHeight() / 2;
                destPos.y += this._destShape.getHeight() / 2;
            }

            gapY = Math.abs(destPos.y - origPos.y);

            gapY /= 2;
            points = [
                {
                    x: origPos.x,
                    y: origPos.y
                },
                {
                    x: origPos.x,
                    y: origPos.y + (gapY * (destPos.y > origPos.y ? 1 : -1))
                },
                {
                    x: destPos.x,
                    y: origPos.y + (gapY * (destPos.y > origPos.y ? 1 : -1))
                },
                {
                    x: destPos.x,
                    y: destPos.y  
                }
            ];
        } else {
            if (destPos.x > origPos.x) {
                origPos.x += this._origShape.getWidth() / 2;
                destPos.x -= this._destShape.getWidth() / 2;
            } else {
                origPos.x -= this._origShape.getWidth() / 2;
                destPos.x += this._destShape.getWidth() / 2;
            }

            gapX = Math.abs(destPos.x - origPos.x);

            gapX /= 2;
            points = [
                {
                    x: origPos.x,
                    y: origPos.y
                },
                {
                    x: origPos.x + (gapX * (destPos.x > origPos.x ? 1 : -1)),
                    y: origPos.y
                },
                {
                    x: origPos.x + (gapX * (destPos.x > origPos.x ? 1 : -1)),
                    y: destPos.y
                },
                {
                    x: destPos.x,
                    y: destPos.y  
                }
            ];
        }
    }

    paths = this._dom.paths || [];

    for (var i = 0; i < points.length - 1; i += 1) {
        path = paths[i] || document.createElementNS('http://www.w3.org/2000/svg', 'line');
        path.setAttribute("x1", points[i].x);
        path.setAttribute("y1", points[i].y);
        path.setAttribute("x2", points[i + 1].x);
        path.setAttribute("y2", points[i + 1].y);
        path.setAttribute("stroke", "black");

        this._html.appendChild(path);
        paths[i] = paths[i] || path;
    }

    this._dom.paths = paths;
    this._dom.arrow.setAttribute("transform", `translate(${points[i].x}, ${points[i].y})`);
    if (points[i-1].x === points[i].x) {
        this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${points[i].y > points[i-1].y ? 270 : 90})`);
    } else {
        this._dom.arrowRotateContainer.setAttribute("transform", `scale(0.5, 0.5) rotate(${points[i].x > points[i-1].x ? 180 : 0})`);
    }
    this._html.appendChild(this._dom.arrow);
    this._points = points;
    this._updateBPMNWaypoint();

    return this;
};

Connection.prototype._createHTML = function () {
    var wrapper,
        arrowWrapper,
        arrowWrapper2,
        arrow;

    if (this._origShape === this.destShape) {
        return this;
    }

    wrapper = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    wrapper.setAttribute("id", this._id);
    //wrapper.setAttribute("transform", `translate(${this._position.x}, ${this._position.y})`);
    wrapper.setAttribute("class", "connection");

    arrowWrapper = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    arrowWrapper2 = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    arrowWrapper2.setAttribute("transform", "scale(0.5,0.5) rotate(-180)");
    arrow = document.createElementNS("http://www.w3.org/2000/svg", 'path');
    arrow.setAttribute("end", "target");
    arrow.setAttribute("d", "M 26 -13 L 0 0 L 26 13 z");

    arrowWrapper2.appendChild(arrow);
    arrowWrapper.appendChild(arrowWrapper2);
    this._dom.arrow = arrowWrapper;
    this._dom.arrowRotateContainer = arrowWrapper2;
    // <g class="marker-arrowheads" id="v-399">
    //     <g class="marker-arrowhead-group marker-arrowhead-group-target" id="v-403" transform="translate(240,170.5) scale(0.5,0.5) rotate(-180)">
    //         <path class="marker-arrowhead" end="target" d="M 26 0 L 0 13 L 26 26 z"></path>
    //     </g>
    // </g>

    this._html = wrapper;
    return this._connect();
};

var Canvas = function (settings) {
    Element.call(this, settings);
    this._width = null;
    this._height = null;
    this._elements = [];
    this._dom = {};
    this._businessObject = {};
    this._connections = [];
    this._onSelectShapeHandler = null;
    this.__bulkAction = false;
    this._dragAndDropManager = null;
    Canvas.prototype._init.call(this, settings);
};

Canvas.prototype = new Element();
Canvas.prototype.constructor = Canvas;

Canvas.prototype._init = function (settings) {
    settings = $.extend({
        width: '100%',
        height: '300px',
        data: settings.data,
        onSelectShape: null,
        onReady: null
    }, settings);

    this._width = settings.width;
    this._height = settings.height;
    this._dragAndDropManager = new DragAndDropManager(this);
    this._onSelectShapeHandler = settings.onSelectShape;
    this._createBusinessObject();
    this._parseData(settings.data, (i) => {
        if (typeof settings.onReady === 'function') {
            settings.onReady(this);
        }
    });
};

Canvas.prototype._createBusinessObject = function () {
    var bpmnDia = BPMNFactory.create('bpmndi:BPMNDiagram', {
            id: 'dia_' + this._id
        }),
        bpmnPlane = BPMNFactory.create('bpmndi:BPMNPlane', {
            bpmnElement: undefined,
            id: 'plane_' + generateUniqueId()
        });

    bpmnDia.plane = bpmnPlane;
    this._businessObject.diagram = bpmnDia;
    this._businessObject.di = bpmnPlane;
    this._elem = {};

    this._businessObject.elem = BPMNFactory.create('bpmn:Process', {
        id: "pmui-" + generateUniqueId()
    });

    if (this._businessObject.di && (!this._businessObject.di.bpmnElement)) {
        this._businessObject.di.bpmnElement = this._businessObject.elem;
    }

    return this;
};

Canvas.prototype.getBusinessObject = function () {
    return this._businessObject;
};

Canvas.prototype._addToBusinessObject = function (element) {
    var eBusinessObject = element.getBusinessObject(),
        businessObject = this._businessObject,
        eDi,
        di,
        children;

    if (element instanceof Shape) {
        if (eBusinessObject.elem.$parent !== businessObject.elem) {
            if (!businessObject.elem) {
                eBusinessObject.$parent = null;
            } else {
                children = businessObject.elem.get('flowElements');
                children.push(eBusinessObject.elem);
                eBusinessObject.elem.$parent = businessObject.elem;
            }
        }

        eDi = eBusinessObject.di;
        di = businessObject.di;

        if (eDi.$parent !== di) {
            children = (di || eDi.$parent).get('planeElement');

            if(di) {
                children.push(eDi);
                eDi.$parent = di;
            } else {
                CollectionRemove(children, eDi);
                eDi.$parent = null;
            }
        }    
    } else {
        if (eBusinessObject.$parent !== businessObject.elem) {
            if (!businessObject.elem) {
                eBusinessObject.$parent = null;
            } else {
                children = businessObject.elem.get('flowElements');
                children.push(eBusinessObject);
                eBusinessObject.$parent = businessObject.elem;
            }
        }

        eDi = eBusinessObject.di;
        di = businessObject.di;

        if (eDi.$parent !== di) {
            children = (di || eDi.$parent).get('planeElement');

            if (di) {
                children.push(eDi);
                eDi.$parent = di;
            }
        }
    }

    return this;
};

Canvas.prototype.addElement = function (element) {
    this._elements.push(element);
    this._dragAndDropManager.registerShape(element);

    this._addToBusinessObject(element);

    if (this._html) {
        this._dom.container.appendChild(element.getHTML());
    }

    return this;
};

Canvas.prototype.clearElements = function () {
    this._elements.forEach((i) => {
        try {
            this._dom.container.removeChild(i.getHTML());
        } catch (e) {}
    });
    this._elements = [];
    return this;
};

Canvas.prototype._createElement = function (def) {
    return BPMNElementFactoy.create(def);
};

Canvas.prototype.setElements = function (elements) {
    this.clearElements();
    elements.forEach((i) => this.addElement(i));

    return this;
};

Canvas.prototype.getElementById = function (id) {
    return this._elements.find((i) => i.getID() === id);
};

Canvas.prototype._parseData = function (data, cb) {
    var that = this;

    BPMNFactory.fromXML(data, function (err, definitions) {
        if (err) {
            throw new Error(err.message);
        }
        var visitor = {

            root: function(element) {
            //console.log(element);
            //return importer.add(element);
            },

            element: (element, parentShape) => {
                if (element.$type === 'bpmn:SequenceFlow') {
                    that.connect(element.sourceRef.id, element.targetRef.id, element.id);
                } else {
                    that.addElement(BPMNElementFactoy.create(element)); 
                }
                //BPMNElementFactoy.create(element);
            // return importer.add(element, parentShape);
            },

            error: function(message, context) {
            //console.log(message);
            // warnings.push({ message: message, context: context });
            }
        };

        var walker = new BpmnTreeWalker(visitor);

        // traverse BPMN 2.0 document model,
        // starting at definitions
        walker.handleDefinitions(definitions);
        if (typeof cb === 'function') {
            cb();
        }
    });
    return this;
};

Canvas.prototype.connect = function (origin, destination, connection_id) {
    var connection;
    origin = this.getElementById(origin);
    destination = this.getElementById(destination);

    if (origin && destination && origin !== destination) {
        connection = new Connection({
            id: connection_id,
            origShape: origin,
            destShape: destination
        });
        this._connections.push(connection);
        this._addToBusinessObject(connection);
        if (this._html) {
            this._dom.container.appendChild(connection.getHTML());
        }
    }

    return this;
};

Canvas.prototype._onSelectShape = function (shape) {
    if (typeof this._onSelectShapeHandler === 'function') {
        this._onSelectShapeHandler(shape);
    }

    return this;
};

Canvas.prototype._createHTML = function () {
    var svg, 
        g;

    if (this._html) {
        return this;
    }

    svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttribute("version", "1.1");
    svg.style.width = this._width;
    svg.style.height = this._height;
    svg.style.background = "#F0F0F0";

    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', 'scale(1, 1)');

    svg.appendChild(g);

    this._dom.container = g;
    this._html = svg;

    return this.setElements(this._elements.slice(0))
        .setID(this._id);
};

var DragAndDropManager = function (canvas) {
    this._canvas = canvas;
    this._target = null;
    this._fromTarget = null;
    this._diff = null;
    this._registry = {};
    this._dom = {};

    this._init();
};

DragAndDropManager.prototype._getShape = function (element) {
    return this._registry[element.id];
};

DragAndDropManager.prototype._init = function () {
    var diff,
        dragged = false;
    $(this._canvas.getHTML())
    // .on('mousemove', (e) => {
    //     if (this._target) {
    //         this._target.setPosition(e.offsetX - diff.x, e.offsetY - diff.y);
    //         this._target._connections.forEach(i => i._connect());
    //         this._fromTarget = null;
    //         dragged = true;
    //     } else if (this._fromTarget) {
    //         this._dom.line.setAttribute("x1", this._fromTarget.getX());
    //         this._dom.line.setAttribute("y1", this._fromTarget.getY());
    //         this._dom.line.setAttribute("x2", e.offsetX - 1);
    //         this._dom.line.setAttribute("y2", e.offsetY - 1);
    //     }
    // }).on('mouseleave',  () => {
    //     var html;

    //     if (!this._target) return;

    //     html = this._target.getHTML();
    //     this._target.setPosition(html.getCTM().e, html.getCTM().f);
    //     this._target = null;
    // })
    // .on('mousedown', '.shape', (e) => {
    //     this._target = this._getShape(e.currentTarget);
    //     diff = {
    //         x: e.offsetX - this._target.getX(),
    //         y: e.offsetY - this._target.getY()
    //     };
    //     dragged = false;
    // }).on('mouseup', '.shape', (e) => {
        
    //             console.log("up");
    // }).on('click', '.shape', (e) => {
    //     if (!dragged){
    //         if (this._fromTarget) {
    //             this._canvas.connect(this._fromTarget.getID(), this._getShape(e.currentTarget).getID());
    //             this._dom.line.setAttribute("stroke", "");
    //         } else {
    //             this._dom.line.setAttribute("x1", 0);
    //             this._dom.line.setAttribute("y1", 0);
    //             this._dom.line.setAttribute("x2", 0);
    //             this._dom.line.setAttribute("y2", 0);
    //             this._dom.line.setAttribute("stroke", "black");
    //             this._canvas._dom.container.appendChild(this._dom.line);
    //         }
    //         this._fromTarget = this._fromTarget ? null : this._getShape(e.currentTarget);      
    //     }

    //     if (this._target){
    //         this._target = null;    
    //     }
    //     dragged = false;
    //     e.stopPropagation();
    // }).on('click', () => {
    //     //this._fromTarget = null;
    //     this._dom.line.setAttribute("stroke", "");
    // })
    .on('click', '.shape', e => {
        var shape = this._getShape(e.currentTarget);

        this._canvas._onSelectShape(shape);
    });

    this._dom.line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

    return this;
};

DragAndDropManager.prototype.registerShape = function (shape) {
    this._registry[shape._id] = shape;
    
    return this;
};

var BPMNProject = function (settings) {
    Element.call(this, settings);
    this._canvas = null;
    this._name = null;
    this._businessObject = {};
    BPMNProject.prototype._init.call(this, settings);
};

BPMNProject.prototype = new Element();
BPMNProject.prototype.constructor = BPMNProject;

BPMNProject.prototype._init = function (settings) {
    settings = $.extend({
        data: settings.data,
        onSelectShape: null,
        onReady: null,
        name: ''
    }, settings);

    this._name = settings.name;
    this._diagram = settings.diagram;
    this._canvas = new Canvas({
        id: settings.id,
        data: settings.data,
        width: 14000,
        height: 14000,
        onSelectShape: settings.onSelectShape,
        onReady: settings.onReady
    });

    this._createBusinessObject(() => this._addToBusinessObject(this._canvas));
};

BPMNProject.prototype._addToBusinessObject = function (element) {
    var eBusinessObject = element.getBusinessObject();

    this._businessObject.get("diagrams").push(eBusinessObject.diagram);
    this._businessObject.get("rootElements").push(eBusinessObject.elem);

    return this;
};

BPMNProject.prototype._createBusinessObject = function (cb) {
    var emptyXMLDef = '<?xml version="1.0" encoding="UTF-8"?>' +
                    '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="BPMNProcessmaker" targetNamespace="http://bpmn.io/schema/bpmn">' +
                    '</bpmn2:definitions>';

    BPMNFactory.fromXML(emptyXMLDef, (err, definition) => {
        if (err) {
            throw new Error(err.message);
        }
        this._businessObject = definition;
        cb();
    });
    return this;
};

BPMNProject.prototype.toXMLDefinition = function (cb) {
    var that = this,
        typesMap = {
            "text": "string"
        };
    BPMNFactory.toXML(this._businessObject, function (err, data) {
        var parser, xmlDoc, shapes, processNode;

        parser = new DOMParser();
        xmlDoc = parser.parseFromString(data,"text/xml");
        processNode = xmlDoc.querySelector('process');
        processNode.setAttribute("name", that._name);
        shapes = that._canvas._elements;
        shapes.forEach((shape) => {
            let shapeNode = Array.from(processNode.children).find((k) => k.id === 'el_' + shape.getID()),
                cfg = shape.getProcessConfig(),//{"form":[{"name":"nombre","display_name":"Nombre","type":"text","default":""},{"name":"apellido","display_name":"Apellido","type":"text","default":""}]},
                extElements = xmlDoc.createElement('bpmn2:extensionElements'),
                formData = xmlDoc.createElement('camunda:formData'),
                inputOutput = xmlDoc.createElement('camunda:inputOutput'),
                previousShapes, output = [], aux;

            if (shape instanceof Activity) {
                aux = shapeNode;
                shapeNode = xmlDoc.createElement('bpmn2:userTask');

                for (let attr in aux.attributes) {
                    if (aux.attributes.hasOwnProperty(attr)) {
                        shapeNode.setAttribute(aux.attributes[attr].name, aux.attributes[attr].value);
                    }
                }

                while (aux.children.length) {
                    shapeNode.appendChild(aux.children[0]);
                }

                aux.replaceWith(shapeNode);
                shapeNode.setAttribute('camunda:candidateUsers', cfg.users && cfg.users.map(user => {
                    return user.id;
                }).join(","));
            }

            cfg.form && cfg.form.forEach((j) => {
                let formField = xmlDoc.createElement('camunda:formField');
                formField.setAttribute("id", j.name);
                formField.setAttribute("label", j.display_name);
                formField.setAttribute("type", typesMap[j.type]);

                formData.appendChild(formField);

                output.push(j.name);
            });

            previousShapes = shape.getConnectedShapes().prev;
            aux = {};
            previousShapes.forEach((prevShape) => {
                let cfg = prevShape.getProcessConfig();
                cfg.form && cfg.form.forEach(field => {
                    aux[field.name] = field;
                });
            });

            for (let field in aux) {
                let inputParemeter = xmlDoc.createElement('camunda:inputParameter');
                inputParemeter.setAttribute("name", aux[field].name);
                inputOutput.appendChild(inputParemeter);              
            }

            output.forEach(param => {
                let outputParameter = xmlDoc.createElement('camunda:outputParameter');

                outputParameter.setAttribute("name", param);
                inputOutput.appendChild(outputParameter);
            });

            extElements.appendChild(formData);
            extElements.appendChild(inputOutput);
            shapeNode.appendChild(extElements);
        });

        xmlDoc.documentElement.setAttribute("xmlns:camunda", "http://camunda.org/schema/1.0/bpmn");
        console.log(xmlDoc, that);

        return cb && cb(err, data);   
    });
};

BPMNProject.prototype._createHTML = function () {
    var html = document.createElement('div');

    html.id = this._id;
    html.className = "bpmn-project";

    html.appendChild(this._canvas.getHTML());

    this._html = html;
    return this;
};

var BPMNElementFactoy = (function () {
    var typesMap = {
        "bpmn:StartEvent": StartEvent,
        "bpmn:Task": Activity,
        "bpmn:EndEvent": EndEvent,
        "bpmn:SequenceFlow": Connection    
    };

    function getShapeConfig (def) {
        var attrs = def.di;
        return def.$type === 'bpmn:SequenceFlow' ? {
            id: def.id,
            origShape: def.sourceRef.id, 
            destShape: def.targetRef.id
        } : {
            id: def.id,
            text: def.name || "",
            width: attrs.bounds.width,
            height: attrs.bounds.height,
            position: {
                x: attrs.bounds.x,
                y: attrs.bounds.y
            }
        };
    };

    return {
        create: function (def) {
            var Type = typesMap[def.$type],
                cfg = getShapeConfig(def);

            if (!Type) {
                throw new Error(`type "${def.$type}" is not supported`);
            }

            return new Type(cfg);
        }
    };
}());