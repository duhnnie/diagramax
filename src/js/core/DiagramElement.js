import BaseElement from './BaseElement';
import Canvas from '../canvas/Canvas';
import DiagramText from './DiagramText';
import SelectBehavior from '../behavior/SelectBehavior';
import ContextMenuBehavior from '../behavior/ContextMenuBehavior';

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

    this
      .setText(settings.text)
      .setCanvas(settings.canvas);
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
   * Set the Canvas the instance will belong to.
   * @param {Canvas} canvas
   * @return {DiagramElement} this.
   */
  setCanvas(canvas) {
    if (!(canvas === null || canvas instanceof Canvas)) {
      throw new Error('setCanvas(): Invalid parameter.');
    }

    if (this._canvas !== canvas) {
      if (this._canvas) {
        this.remove();
      }
      this._canvas = canvas;
      canvas.addElement(this);
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
   * Creates the instance's HTML.
   * @returns {DiagramElement} this.
   */
  _createHTML() {
    if (this._html) {
      return this;
    }

    const wrapper = BaseElement.createSVG('g');
    const title = BaseElement.create('title');

    title.textContent = this._text.getText();
    wrapper.classList.add('element');
    wrapper.setAttribute('focusable', false);
    wrapper.appendChild(title);
    wrapper.appendChild(this._text.getHTML());

    this._dom.title = title;

    this._html = wrapper;

    if (this._dom.mainElement) {
      const { mainElement } = this._dom;
      // TODO: This can be set in CSS?
      mainElement.setAttribute('cursor', 'pointer');
      mainElement.classList.add('main-element');
    }

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
