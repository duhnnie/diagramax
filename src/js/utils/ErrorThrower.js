export default {
  custom(message) {
    throw new Error(message);
  },

  notImplemented() {
    this.custom('Not implemented.');
  },

  invalidParameter() {
    this.custom('Invalid paramameter');
  },
};
