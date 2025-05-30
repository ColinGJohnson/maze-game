export default class InputHandler {
  constructor() {
    this._pressed = {};

    this.UP = 38;
    this.DOWN = 40;
    this.LEFT = 37;
    this.RIGHT = 39;
    this.SPACE = 32;

    window.addEventListener("keydown", (event) => this.onKeydown(event));
    window.addEventListener("keyup", (event) => this.onKeyup(event));
  }

  /**
   * Check if a key is currently pressed
   * @param {number} keyCode - The key code to check
   * @returns {boolean} True if the key is down, false otherwise
   */
  isDown(keyCode) {
    return !!this._pressed[keyCode];
  }

  reset() {
    this._pressed = {};
  }

  /**
   * Handle keydown event
   * @param {KeyboardEvent} event
   */
  onKeydown(event) {
    if (event.repeat) return;
    this._pressed[event.keyCode] = true;
  }

  /**
   * Handle keyup event
   * @param {KeyboardEvent} event
   */
  onKeyup(event) {
    delete this._pressed[event.keyCode];
  }
}
