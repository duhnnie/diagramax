import uuid from 'uuid/v1';

/**
 * @class The base class for every component that has a HTML representation.
*/
class BaseElement {
  /**
   * Create a new HTMLElement
   * @param {String} [tag="div"] The tag name for the new element.
   * @return {HTMLElement} The new HTMLElement
   */
  static create(tag = 'div') {
    return document.createElement(tag);
  }

  /**
   * Creates a new SVGElement.
   * @param {String} tagName The tag name for the new SVG element.
   * @return {SVGElement} The new SVGElement
   */
  static createSVG(tagName) {
    return document.createElementNS('http://www.w3.org/2000/svg', tagName);
  }

  static get type() {
    return 'element';
  }

  /**
   * Return the type of the object.
   * @returns {String} The type name.
   */
  get type() {
    return this.constructor.type;
  }

  /**
   * Create an instance of BaseElement.
   * @constructor
   * @param {Object} settings An object containing all the settings for the element.
   * @param {String} [settings.id] The id for the HTML element, if not provided one will be generated.
   */
  constructor(settings) {
    /**
     * @protected
     * @type {String}
     * @description The instance's id.
     */
    this._id = null;
    /**
     * @protected
     * @type {HTMLElement}
     * @description The instance's HTML.
     */
    this._html = null;

    settings = {
      id: uuid(),
      ...settings,
    };

    this.setID(settings.id);
  }

  /**
   * Set the instance id.
   * @param {string} id The id to set.
   * @return {BaseElement} this.
   */
  setID(id) {
    this._id = id;

    if (this._html) {
      this._html.setAttribute('id', id);
    }

    return this;
  }

  /**
   * Return the instance id.
   * @returns {String} The instance's id.
   */
  getID() {
    return this._id;
  }

  // TODO: Does this should be defined here?
  /**
   * @abstract
   * @description Trigger an Event to the Canvas' EventBus.
   * @returns {HTMLElement} this.
   */
  trigger() { return this; }

  /**
   * @abstract
   * @protected
   * @description Create the HTML for the instance.
   * @returns {BaseElement} this.
   */
  _createHTML() { return this; }

  /**
   * Return the instance's HTML.
   * @returns {HTMLElement} The instance's HTMLElement.
   */
  getHTML() {
    if (!this._html) {
      this._createHTML();
    }
    return this._html;
  }

  /**
   * @description Remove the element from DOM.
   */
  remove() {
    if (this._html) {
      this._html.remove();
      this._html = null;
    }
  }
}

export default BaseElement;
