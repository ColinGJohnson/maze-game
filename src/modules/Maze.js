/**
 * A square maze.
 */
export default class Maze {
  size;
  maze;

  constructor(size) {
    this.size = size;
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
    let mazeArray = Array.from(Array(mazeSize), () =>
      new Array(mazeSize).fill(-1),
    );

    /**
     * Randomly selects a coordinate to proceed to given a partially completed
     * maze and a coordinate to proceed from.
     *
     * @param mazeArray
     * @param x
     * @param y
     * @returns {undefined|*}
     */
    let chooseNext = function (mazeArray, x, y) {
      let options = [];
      let jumpDist = 2;

      // up
      if (y > jumpDist && mazeArray[x][y - jumpDist] === -1) {
        options.push({ x: x, y: y - jumpDist });
      }

      // down
      if (y < mazeArray.length - 1 && mazeArray[x][y + jumpDist] === -1) {
        options.push({ x: x, y: y + jumpDist });
      }

      // left
      if (x > jumpDist && mazeArray[x - jumpDist][y] === -1) {
        options.push({ x: x - jumpDist, y: y });
      }

      // right
      if (
        x < mazeArray.length - jumpDist &&
        mazeArray[x + jumpDist][y] === -1
      ) {
        options.push({ x: x + jumpDist, y: y });
      }

      // return a random direction or undefined if no valid directions exist
      return options.length === 0
        ? undefined
        : options[Math.floor(Math.random() * options.length)];
    };

    // start at 1,1
    let genStack = [{ x: 1, y: 1 }];

    let furthestCell = { x: 1, y: 1 };
    let maxStack = 0;

    // continue generating until backtracking is complete
    while (genStack.length > 0) {
      // get current cell by peeking stack
      let current = genStack[genStack.length - 1];

      // mark current cell as visited (0) in mazeArray
      mazeArray[current.x][current.y] = 0;

      // check if this is the new furthest cell from 1,1
      if (genStack.length > maxStack) {
        furthestCell = current;
        maxStack = genStack.length;
      }

      // mark cell between current and last as visited (0)
      if (genStack.length > 1) {
        let previous = genStack[genStack.length - 2];

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
      let next = chooseNext(mazeArray, current.x, current.y);
      if (next) {
        genStack.push(next);

        // otherwise backtrack
      } else {
        genStack.pop();
      }
    }

    // mark the furthest cell from (1,1), which will be the goal
    mazeArray[furthestCell.x][furthestCell.y] = -2;

    return mazeArray;
  }
}
