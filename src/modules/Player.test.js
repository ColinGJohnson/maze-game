import { describe, expect, it } from "vitest";
import Player from "./Player";

describe("Player", () => {
  it("should initialize with default values", () => {
    const player = new Player();
    expect(player.mazesCompleted).toBe(0);
    expect(player.x).toBe(1);
    expect(player.y).toBe(1);
  });

  it("should reset position to (1, 1)", () => {
    const player = new Player();
    player.x = 5;
    player.y = 7;
    player.resetPosition();
    expect(player.x).toBe(1);
    expect(player.y).toBe(1);
  });
});
