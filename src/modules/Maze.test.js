import { beforeEach, describe, expect, it } from "vitest";
import Maze from "./Maze";
import Player from "./Player.js";

describe("Maze", () => {
  let maze;

  beforeEach(() => {
    maze = new Maze(5);
  });

  it("should initialize the maze with correct size and default values", () => {
    expect(maze.maze.length).toBe(5);
    expect(maze.maze[0].length).toBe(5);
    expect(maze.maze.every((row) => row.every((value) => value <= 0))).toBe(true);
  });

  it("should record a player visit", () => {
    const player = new Player(1, 1);
    maze.visit(player);
    expect(maze.get(1, 1)).toBe(1);
    maze.visit(player);
    expect(maze.get(1, 1)).toBe(2);
  });

  it("should get the correct value from the maze at given coordinates", () => {
    maze.maze[0][0] = 42;
    expect(maze.get(0, 0)).toBe(42);
  });

  it("should throw an error if the maze size is less than 5", () => {
    expect(() => new Maze(4)).toThrow();
  });
});
