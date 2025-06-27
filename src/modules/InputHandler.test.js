import { beforeEach, describe, expect, it } from "vitest";
import InputHandler, { Key } from "./InputHandler.js";

describe("InputHandler", () => {
  let inputHandler;

  beforeEach(() => {
    inputHandler = new InputHandler();
  });

  it("checks if a key is down using isDown method", () => {
    dispatchKeyEvent("SPACE", "keydown");
    expect(inputHandler.pressed(Key.SPACE)).toBe(true);
  });

  it("removes key from pressed state on key up", () => {
    dispatchKeyEvent("A", "keydown");
    dispatchKeyEvent("A", "keyup");
    expect(inputHandler.pressed(Key.A)).toBe(false);
  });

  it("resets all pressed keys", () => {
    doForAllKeys((key) => dispatchKeyEvent(key, "keydown"));
    doForAllKeys((key) => expect(inputHandler.pressed(Key[key])).toBe(true));
    inputHandler.reset();
    doForAllKeys((key) => expect(inputHandler.pressed(Key[key])).toBe(false));
  });
});

function dispatchKeyEvent(key, type) {
  window.dispatchEvent(new KeyboardEvent(type, { keyCode: Key[key] }));
}

function doForAllKeys(callback) {
  for (const key in Key) {
    callback(key);
  }
}
