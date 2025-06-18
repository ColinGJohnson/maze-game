import seedrandom from "seedrandom";

import { GOAL, WALL } from "./Maze.js";

const PATH = 0;
const JUMP_DIST = 2;
const START_POSITION = { x: 1, y: 1 };
const BACKTRACK_PROBABILITY = 0.9;

/**
 * Iteratively generates a random maze through backtracking.
 * @param {number} mazeSize The edge length of the maze to be generated.
 * @param {Date} date Day to use as a seed for random number generation.
 * @returns {number[][]} A two-dimensional array of integers representing the maze.
 */
export function generate(mazeSize, date = new Date()) {
  const random = dailyRandom(date);
  const mazeArray = initializeMazeGrid(mazeSize);
  const pathData = populateMazeGrid(mazeArray, random);

  const { furthestCell } = pathData;
  mazeArray[furthestCell.x][furthestCell.y] = GOAL;

  return mazeArray;
}

/**
 * Creates a new maze grid filled with walls
 * @param {number} size The size of the maze grid
 * @returns {number[][]} A grid filled with wall values
 */
function initializeMazeGrid(size) {
  return Array.from(Array(size), () => new Array(size).fill(WALL));
}

/**
 * Connects two adjacent cells by marking the cell between them as a path
 * @param {number[][]} maze The maze grid
 * @param {Object} current The current cell
 * @param {Object} previous The previous cell
 */
function connectCells(maze, current, previous) {
  if (!previous) return;

  const dx = Math.sign(current.x - previous.x);
  const dy = Math.sign(current.y - previous.y);

  const connectionX = current.x - dx;
  const connectionY = current.y - dy;

  maze[connectionX][connectionY] = PATH;
}

/**
 * Finds the longest path through the maze using a backtracking algorithm
 * @param {number[][]} maze The maze grid to carve paths through
 * @param {Object} random The random number generator
 * @returns {Object} Data about the path including the furthest cell
 */
function populateMazeGrid(maze, random) {
  const genStack = [{ ...START_POSITION, distance: 0 }];
  const visited = new Set();
  let furthestCell = { ...START_POSITION };
  let maxDistance = 0;

  while (genStack.length > 0) {
    const currentIndex = shouldBacktrack(random)
      ? Math.floor(random.quick() * (genStack.length - 1))
      : genStack.length - 1;

    const current = genStack.splice(currentIndex, 1)[0];
    const positionKey = `${current.x},${current.y}`;

    if (visited.has(positionKey)) {
      continue;
    } else {
      visited.add(positionKey);
    }

    maze[current.x][current.y] = PATH;

    if (current.distance > maxDistance) {
      furthestCell = current;
      maxDistance = current.distance;
    }

    connectCells(maze, current, current.previous);
    genStack.push(...nextValidNodes(random, maze, current));
  }

  return { furthestCell, maxDistance };
}

/**
 * Determines if we should backtrack based on random probability
 * @param {Object} random The random number generator
 * @returns {boolean} True if we should backtrack
 */
function shouldBacktrack(random) {
  return random.quick() > BACKTRACK_PROBABILITY;
}

/**
 * Randomly selects a coordinate to visit next given a partially completed
 * maze and a coordinate to start from.
 */
function nextValidNodes(random, mazeArray, start) {
  const isValid = (move) =>
    move.x >= 0 &&
    move.y >= 0 &&
    move.x < mazeArray.length &&
    move.y < mazeArray[0].length &&
    mazeArray[move.x][move.y] === WALL;
  const randomCompare = () => random.quick() - 0.5;
  return nextNodes(start).filter(isValid).sort(randomCompare);
}

/**
 * Calculates the next possible nodes based on a starting position and a fixed jump distance.
 */
function nextNodes(start) {
  const getMove = (newX, newY) => ({
    x: newX,
    y: newY,
    previous: start,
    distance: start.distance + 1,
  });
  return [
    getMove(start.x, start.y - JUMP_DIST), // up
    getMove(start.x, start.y + JUMP_DIST), // down
    getMove(start.x - JUMP_DIST, start.y), // left
    getMove(start.x + JUMP_DIST, start.y), // right
  ];
}

function dailyRandom(date) {
  const seed = date.toLocaleDateString("en-US", { timeZone: "UTC" });
  return new seedrandom(seed);
}
