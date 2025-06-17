import { generate } from "./MazeGenerator";
import { describe, it, expect } from "vitest";
import { GOAL, WALL } from "./Maze.js";

describe("generate", () => {
  it("should generate a maze of the given size", () => {
    const mazeSize = 5;
    const result = generate(mazeSize);

    expect(result.length).toBe(mazeSize);
    expect(result.every((row) => row.length === mazeSize)).toBe(true);
  });

  it("should mark the starting cell as 0", () => {
    const mazeSize = 5;
    const result = generate(mazeSize);

    expect(result[1][1]).toBe(0);
  });

  it("should mark a single cell as the goal", () => {
    const mazeSize = 7;
    const result = generate(mazeSize);

    const flatMaze = result.flat();
    const goalCount = flatMaze.filter((cell) => cell === GOAL).length;

    expect(goalCount).toBe(1);
  });

  it("should only contain valid cell values (-1, 0, 2)", () => {
    const mazeSize = 5;
    const result = generate(mazeSize);

    const validValues = [WALL, GOAL, 0];
    const allCellsValid = result.flat().every((cell) => validValues.includes(cell));

    expect(allCellsValid).toBe(true);
  });

  it("should generate a maze with at least one wall (-1)", () => {
    const mazeSize = 7;
    const result = generate(mazeSize);

    const hasWalls = result.flat().some((cell) => cell === -1);
    expect(hasWalls).toBe(true);
  });

  it("should generate a unique maze for different random seeds", () => {
    const mazeSize = 5;

    const firstMaze = generate(mazeSize, new Date(1999, 11, 31));
    const secondMaze = generate(mazeSize, new Date(2000, 0, 1));
    const thirdMaze = generate(mazeSize, new Date(1999, 11, 31));

    expect(firstMaze).not.toEqual(secondMaze);
    expect(secondMaze).not.toEqual(thirdMaze);
    expect(thirdMaze).toEqual(firstMaze);
  });
});
