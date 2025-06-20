import { generate } from "./MazeGenerator.js";

export const WALL = -1;
export const GOAL = -2;

/**
 * A square maze.
 */
export default class Maze {
  size;
  maze;

  constructor(size) {
    if (size < 5) throw new Error("Maze size must be at least 5");
    this.size = size;
    this.maze = generate(this.size);
  }

  /**
   * Record that a player has visited a square in this maze. The integer stored in the maze array represents the
   * number of times a square in the maze has been visited.
   *
   * @param {Player} player The player visiting a square in this maze.
   */
  visit(player) {
    this.maze[player.x][player.y] += 1;
  }

  /**
   * Retrieves the value from the maze at the specified coordinates.
   *
   * @param {number} x - The x-coordinate within the maze.
   * @param {number} y - The y-coordinate within the maze.
   * @return {*} The value at the specified coordinates in the maze.
   */
  get(x, y) {
    return this.maze[x][y];
  }
}
