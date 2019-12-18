const BPMNFactory = (function () {
  const bpmn_moddle = new BpmnModdle();

  return {
    create(descriptor, attrs) {
      return bpmn_moddle.create(descriptor, attrs);
    },
    fromXML(data, callback) {
      return bpmn_moddle.fromXML(data, callback);
    },
    toXML(data, callback) {
      return bpmn_moddle.toXML(data, callback);
    },
  };
}());
