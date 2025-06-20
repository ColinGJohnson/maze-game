export const Key = {
  SPACE: 32,
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  W: 87,
  A: 65,
  S: 83,
  D: 68,
};

export default class InputHandler {
  constructor() {
    this._pressed = {};
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

  anyPressed() {
    return Object.keys(this._pressed).length > 0;
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
