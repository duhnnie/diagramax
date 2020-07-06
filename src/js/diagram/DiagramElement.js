import BaseElement from '../core/BaseElement';
import Canvas from './Canvas';
import DiagramText from './DiagramText';
import SelectBehavior from '../behavior/SelectBehavior';
import ContextMenuBehavior from '../behavior/ContextMenuBehavior';
import Model from '../data/Model';

/**
 * The position of a rectangle boundary, using the top-left corner as the origin.
 * @typedef {Object} Bounds
 * @property {Number} top Units to the top from the origin.
 * @property {Number} right Units to the right from the origin.
 * @property {Number} bottom Units to the bottom from the origin.
 * @property {Number} left Units to the left from the origin.
 */

const DEFAULTS = {
  canvas: null,
  text: '',
  data: {},
};

/**
 * Events DiagramElement dispatches.
 * @readonly
 * @enum {String}
 * @memberof DiagramElement
 * @property {String} REMOVE The component was removed.
 */
const EVENT = Object.freeze({
  /** The component was removed. */
  REMOVE: 'remove',
});

/**
 * @abstract
 * @class The base class for every component that a {@link Canvas} can contain.
 * @extends {BaseElement}
 */
class DiagramElement extends BaseElement {
  /**
   * @inheritdoc
   */
  static get type() {
    return 'diagramElement';
  }

  /**
   * Create an instance of DiagramElement.
   * @param {Object} settings The settings.
   * @param {String} [settings.id] The id for the HTML element, if not provided one will be generated.
   * @param {Canvas} [settings.canvas=null] The Canvas the DiagramElement belongs to.
   * @param {String} [settings.text=""] The text for the DiagramElement.
   */
  constructor(settings) {
    super(settings);
    /**
     * @protected
     * @type {Canvas}
     * @description The Canvas the component belongs to.
     */
    this._canvas = null;
    /**
     * @protected
     * @type {DiagramText}
     * @description The DiagramText for the DiagramElement.
     */
    this._text = new DiagramText();
    /**
     * @protected
     * @type {Object}
     * @description An object literal to hold references to main DiagramElement's HTML elements.
     */
    this._dom = {};
    /**
     * @protected
     * @type {Model}
     * @description The data related to the element.
     */
    this._data = new Model();
    /**
     * @protected
     * @type {ComponentUI}
     */
    this._componentUI = this._getComponentUI();
    /**
     * @protected
     * @type {SelectBehavior}
     */
    this._selectBehavior = new SelectBehavior(this);
    /**
     * @protected
     * @type {ContextMenuBehavior}
     */
    this._contextMenuBehavior = new ContextMenuBehavior(this);

    settings = {
      ...DEFAULTS,
      ...settings,
    };

    this.setText(settings.text)
      .setData(settings.data);
  }

  /**
   * @abstract
   * @protected
   * @description Return an instance of {@link ComponentUI}, which is tied to the current instance and will be used for
   * holding the UI elements for manipulating the instance.
   * @returns {ComponentUI}
   */
  // eslint-disable-next-line class-methods-use-this
  _getComponentUI() {
    throw new Error('_getComponentUI(): This method should be implemented.');
  }

  // TODO: make this method internal.
  // TODO: in this method a call to canvas.addElement(), this method adds the shape to the canvas, so maybe this method
  // should be refactored, this method shouldn't add shape to canvas
  /**
   * @protected
   * Set the Canvas the instance will belong to.
   * @param {Canvas} canvas
   * @return {DiagramElement} this.
   */
  _setCanvas(canvas) {
    if (!(canvas === null || canvas instanceof Canvas)) {
      throw new Error('_setCanvas(): Invalid parameter.');
    }

    if (this._canvas !== canvas) {
      if (this._canvas) {
        this.remove();
      }
      this._canvas = canvas;
    }

    return this;
  }

  /**
   * @protected
   * @description Add a graphic control for manipulating the DiagramElement.
   * @param {SVGElement} svgElement An SVG element to be the graphic control for the DiagramElement.
   * @param {Object} events An object in which the key is an event name and its value is a function or an array of
   * functions to be executed when that event occurs.
   */
  _addControl(svgElement, events) {
    this._componentUI.addControl(svgElement, events);
  }

  /**
   * Select the current instance.
   */
  select() {
    this._selectBehavior.start();
  }

  /**
   * Unselect the current instance.
   */
  unselect() {
    this._selectBehavior.unselect();
  }

  /**
   * If the shape is selected.
   * @returns {Boolean} True is it's selected, False for unselected.
   */
  isSelected() {
    return this._selectBehavior.isSelected();
  }

  /**
   * Unselect and remove the instance from Canvas.
   * @fires DiagramElement.REMOVE
   */
  remove() {
    const { _canvas } = this;

    if (_canvas) {
      this.unselect();
      this._componentUI.remove();
      this._canvas = null;
      super.remove();
      _canvas.dispatchEvent(EVENT.REMOVE, this);
    }

    return this;
  }

  /**
   * Return the Canvas the instance belongs to.
   * @returns {Canvas}
   */
  getCanvas() {
    return this._canvas;
  }

  /**
   * Set the text for the instance.
   * @param {String} text
   * @returns {DiagramElement} this.
   */
  setText(text) {
    this._text.setText(text);

    if (this._dom.title) {
      this._dom.title.text = text;
    }

    return this;
  }

  /**
   * Return the current instance's text.
   * @return {String}
   */
  getText() {
    return this._text.getText();
  }

  /**
   * Trigger an event to the Canvas' event bus.
   * @param {DiagramElement.EVENT} eventName The name for the event.
   * @param {...any} args A list of args to provide to the event's listeners.
   * @returns {DiagramElement} this.
   */
  trigger(eventName, ...args) {
    const canvas = this._canvas;

    if (canvas) {
      canvas.dispatchEvent(eventName, this, ...args);
    }

    return this;
  }

  /**
   * @protected
   * @description Returns the concrete instance's HTMLElement that represent the instance itself.
   * @returns {SVGElement}
   */
  _getMainElement() {
    return this._createHTML()._dom.mainElement;
  }

  /**
   * @abstract
   * @description Return the coordinates of the square boundary that correponds to the instance's SVG element. The
   * coordinates are relative to the Canvas the instance belongs to.
   * @return {Bounds}
   */
  // eslint-disable-next-line class-methods-use-this
  getBounds() { throw new Error('Not implemented'); }

  /**
   * Trigger its parent {@link Canvas._onElementContextMenu Canvas' callback for context menu event}.
   * @param {Event} event The event that triggered the context menu.
   */
  onContextMenu(event) {
    const canvas = this.getCanvas();

    if (canvas) {
      canvas._onElementContextMenu(event, this);
    }
  }

  /**
  * Set the data for the element.
  * @param  {Object} args An object literal to be set.
  * @returns {DiagramElement} this.
  */
  setData(...args) {
    this._data.set(...args);

    return this;
  }

  /**
   * Add a new value to the element's data.
   * @param {String} key The key for the data to set.
   * @param {*} value The value to set.
   * @returns {DiagramElement} this.
   */
  addData(key, value) {
    this._data.set(key, value);

    return this;
  }

  /**
   * Get the data for a specific key.
   * @param {String} key The key the data will be get for.
   * @returns {*} The corresponding value to the provided key.
   */
  getData(key) {
    return this._data.get(key);
  }

  /**
   * Return a boolean asserting whether a value has been associated to the key in the element's data or not.
   * @param {String} key The key of the value to test for presence in the element's data.
   * @returns {Boolean} true if a value with the specified key exists in the element's data; otherwise false.
   */
  hasData(key) {
    return this._data.has(key);
  }

  /**
   * Remove the specified element from a element's data by key.
   * @param {String} key The key of the value to remove from the element's data.
   * @returns {Boolean} true if a value in the element's data existed and has been removed, or false if the value does
   * not exist.
   */
  deleteData(key) {
    return this._data.delete(key);
  }

  /**
   * Remove all elements from the element's data.
   */
  clearData() {
    this._data.clear();
  }

  /**
   * Return an object literal of the element's data.
   * @returns {Object} The element's data in object literal format.
   */
  getAllData() {
    return this._data.toJSON();
  }

  /**
   * Return the element's JSON representation.
   * @returns {Object} The element's JSON representation.
   */
  toJSON() {
    return {
      id: this._id,
      type: this.type,
      text: this.getText(),
      data: this._data.toJSON(),
    };
  }

  /**
   * Creates the instance's HTML.
   * @returns {DiagramElement} this.
   */
  _createHTML() {
    if (this._html) {
      return this;
    }

    const wrapper = BaseElement.createSVG('g');
    const mainElement = BaseElement.createSVG('g');
    const title = BaseElement.create('title');

    title.textContent = this._text.getText();
    // TODO: This can be set in CSS?
    mainElement.setAttribute('cursor', 'pointer');
    mainElement.classList.add('main-element');
    wrapper.classList.add('element');
    wrapper.setAttribute('focusable', false);
    wrapper.append(mainElement);
    wrapper.append(title);
    wrapper.append(this._text.getHTML());

    this._dom.mainElement = mainElement;
    this._dom.title = title;

    this._html = wrapper;

    this._selectBehavior.attach();
    this._contextMenuBehavior.attach();

    return this.setID(this._id);
  }

  /**
   * Returns the HTML for the instance UI layer.
   * @returns {SVGElement}
   */
  getUIHTML() {
    return this._componentUI.getHTML();
  }
}

export default DiagramElement;
export { EVENT };
