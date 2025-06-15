import seedrandom from "seedrandom";

export const WALL = -1;
export const GOAL = -2;

/**
 * A square maze.
 */
export default class Maze {
  size;
  maze;

  constructor(size) {
    this.size = size;
    this.random = dailySeededRandom();
    this.maze = this.generate(this.size);
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

  /**
   * Iteratively generates a random maze through backtracking.
   * @param mazeSize The edge length of the maze to be generated.
   * @returns {any[][]} A two-dimensional array of integers representing the maze.
   */
  generate(mazeSize) {
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
      if (this.random.quick() > 0.9) {
        currentIndex = Math.floor(this.random.quick() * (genStack.length - 1));
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
      genStack.push(...this.nextNodes(mazeArray, current));
    }

    // mark the furthest cell from (1,1), which will be the goal
    mazeArray[furthestCell.x][furthestCell.y] = GOAL;
    return mazeArray;
  }

  /**
   * Randomly selects a coordinate to visit next given a partially completed
   * maze and a coordinate to start from.
   */
  nextNodes(mazeArray, current) {
    const { x, y } = current;
    let options = [];
    let jumpDist = 2;
    const common = { previous: current, distance: current.distance + 1 };

    // up
    if (y > jumpDist && mazeArray[x][y - jumpDist] === WALL) {
      options.push({ x: x, y: y - jumpDist, ...common });
    }

    // down
    if (y < mazeArray.length - 1 && mazeArray[x][y + jumpDist] === WALL) {
      options.push({ x: x, y: y + jumpDist, ...common });
    }

    // left
    if (x > jumpDist && mazeArray[x - jumpDist][y] === WALL) {
      options.push({ x: x - jumpDist, y: y, ...common });
    }

    // right
    if (x < mazeArray.length - jumpDist && mazeArray[x + jumpDist][y] === WALL) {
      options.push({ x: x + jumpDist, y: y, ...common });
    }

    // randomly shuffle options
    options = options.sort(() => this.random.quick() - 0.5);
    return options;
  }
}

function dailySeededRandom() {
  const today = new Date();
  const seed = today.toLocaleDateString("en-US", { timeZone: "UTC" });
  return new seedrandom(seed);
}
