import seedrandom from "seedrandom";

import { GOAL, WALL } from "./Maze.js";

const JUMP_DIST = 2;

/**
 * Iteratively generates a random maze through backtracking.
 * @param mazeSize The edge length of the maze to be generated.
 * @param date Day to use as a seed for random number generation.
 * @returns {any[][]} A two-dimensional array of integers representing the maze.
 */
export function generate(mazeSize, date = new Date()) {
  const random = dailyRandom(date);

  // create new 2D array to store the maze and fill with -1's
  const mazeArray = Array.from(Array(mazeSize), () => new Array(mazeSize).fill(WALL));

  // start at 1,1
  const genStack = [{ x: 1, y: 1, distance: 0 }];
  const visited = new Set();
  let furthestCell = { x: 1, y: 1 };
  let maxDistance = 0;

  // continue generating until backtracking is complete
  while (genStack.length > 0) {
    // random chance to backtrack before doing so is necessary to increase branching factor
    let currentIndex = genStack.length - 1;
    if (random.quick() > 0.9) {
      currentIndex = Math.floor(random.quick() * (genStack.length - 1));
    }
    const current = genStack.splice(currentIndex, 1)[0];

    const key = `${current.x},${current.y}`;
    if (visited.has(key)) {
      continue;
    } else {
      visited.add(key);
    }

    mazeArray[current.x][current.y] = 0;

    // check if this is the new furthest cell from 1,1
    if (current.distance > maxDistance) {
      furthestCell = current;
      maxDistance = current.distance;
    }

    // mark cell between current and last as visited (0)
    const previous = current.previous;
    if (previous) {
      // from left to right
      if (current.x > previous.x) {
        mazeArray[current.x - 1][current.y] = 0;

        // from right to left
      } else if (current.x < previous.x) {
        mazeArray[current.x + 1][current.y] = 0;

        // from above to below
      } else if (current.y > previous.y) {
        mazeArray[current.x][current.y - 1] = 0;

        // from below to above
      } else {
        mazeArray[current.x][current.y + 1] = 0;
      }
    }

    // proceed to an adjacent unvisited cell if one exists
    genStack.push(...nextValidNodes(random, mazeArray, current));
  }

  // mark the furthest cell from (1,1), which will be the goal
  mazeArray[furthestCell.x][furthestCell.y] = GOAL;
  return mazeArray;
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
