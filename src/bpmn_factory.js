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