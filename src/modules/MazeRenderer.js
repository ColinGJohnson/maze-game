import { GameState } from "./MazeGame.js";
import { GOAL, WALL } from "./Maze.js";

/**
 * Manages drawing a square maze on a HTML Canvas element.
 */
export default class MazeRenderer {
  colorRate = 30;

  /**
   * MazeRenderer constructor
   * @param {string} canvasID The id of the HTML5 canvas on which to render graphics.
   */
  constructor(canvasID) {
    this.canvas = document.getElementById(canvasID);
    this.text = document.getElementById("game-text");
    this.ctx = this.canvas.getContext("2d");
  }

  /**
   * Draws a maze on the canvas associated with this MazeRenderer.
   *
   * @param {MazeGame} mazeGame the MazeGame to draw.
   */
  render(mazeGame) {
    this.updateCanvasDimensions(mazeGame.maze.size);
    this.drawBackground();

    if (mazeGame.gameState !== GameState.START) {
      this.drawMaze(mazeGame);
    }

    const topText = this.getTopText(mazeGame);
    if (topText !== this.text.innerHTML) {
      this.text.innerHTML = topText;
    }
  }

  /**
   * Resizes the canvas to fit the current window size.
   *
   * @param {number} mazeSize - mazeSize the MazeGame to draw. Will evenly divide the resulting canvas width.
   */
  updateCanvasDimensions(mazeSize) {
    const container = document.querySelector(".maze-container");

    this.cellWidthPx = Math.round(container.clientWidth / mazeSize);
    const size = this.cellWidthPx * mazeSize;
    this.canvas.width = size;
    this.canvas.height = size;

    this.canvas.style.borderRadius = this.cellWidthPx + "px";
    this.text.style.fontSize = size / 25 + "px";
  }

  /**
   * Fill the canvas with a plain black background.
   */
  drawBackground() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Renders a visual representation of the maze on the canvas.
   *
   * @param {MazeGame} mazeGame - The maze game object containing the maze data.
   */
  drawMaze(mazeGame) {
    const maze = mazeGame.maze;
    const animationLength = 2000;
    const timeSinceStart = Date.now() - mazeGame.gameStartTimestamp;
    const startAnimationProgress = easeInOutSine(Math.min(1, timeSinceStart / animationLength));

    for (let x = 0; x < maze.size; x++) {
      for (let y = 0; y < maze.size; y++) {
        if (maze.get(x, y) !== WALL) {
          this.ctx.fillStyle = this.getCellColor(mazeGame, x, y);
          this.drawCell(maze, x, y, startAnimationProgress);
        }
      }
    }
  }

  drawCell(maze, x, y, t) {
    const m = 4;
    const d = 1 - (x + y) / (maze.size * 2);

    const scale = easeInOutSine(clamp(m * (d + t * (1 + 1 / m) - 1), 0, 1));
    const scaledWidth = Math.round(this.cellWidthPx * scale);

    const topLeft = {
      x: Math.round(x * this.cellWidthPx + (this.cellWidthPx - scaledWidth) / 2),
      y: Math.round(y * this.cellWidthPx + (this.cellWidthPx - scaledWidth) / 2),
    };

    this.ctx.fillRect(topLeft.x, topLeft.y, scaledWidth, scaledWidth);
  }

  /**
   * Determines the color of a specific cell in the maze based on its value:
   *  - Cycle hue if this is the goal cell
   *  - Fill with white if unvisited
   *  - Otherwise dynamically color based on number of visits
   */
  getCellColor(mazeGame, x, y) {
    if (mazeGame.player.x === x && mazeGame.player.y === y) {
      return "gray";
    } else if (mazeGame.maze.get(x, y) === 0) {
      return "#FAF9F6";
    } else if (mazeGame.maze.get(x, y) === GOAL) {
      return "hsl(" + ((Date.now() / 10) % 360) + ", 90%, 50%)";
    } else {
      let hue = 150 - mazeGame.maze.get(x, y) * this.colorRate;
      hue = hue < 0 ? 0 : hue;
      return "hsl(" + hue + ", 90%, 50%)";
    }
  }

  /**
   * @param {MazeGame} mazeGame - The maze game object containing game state information.
   * @returns {string} The text to display based on the current game state:
   *   - At start: Shows instructions to start and movement controls
   *   - During game: Shows elapsed time in seconds
   *   - At end: Shows completion time and restart instructions
   */
  getTopText(mazeGame) {
    const spaceBar = '<span class="input-prompt">\u{E0C8}</span>';
    const arrowKeys = '<span class="input-prompt">\u{E025}</span>';

    if (mazeGame.gameState === GameState.START) {
      return `${spaceBar} to start, ${arrowKeys} to move`;
    } else if (mazeGame.gameState === GameState.IN_GAME) {
      const currentTimeMs = new Date().getTime();
      const secondsPassed = (currentTimeMs - mazeGame.gameStartTimestamp) / 1000;
      return `<b>${secondsPassed.toFixed(2)}</b>`;
    } else if (mazeGame.gameState === GameState.END) {
      const secondsPassed = (mazeGame.gameEndTimestamp - mazeGame.gameStartTimestamp) / 1000;
      return `Finished in <b style="color: #13EF0C">${secondsPassed.toFixed(2)}s</b><br>Press ${spaceBar} restart`;
    }
    return "";
  }
}

/**
 * Returns a number whose value is limited to the given range.
 *
 * @param {Number} number The number to clamp
 * @param {Number} min The lower boundary of the output range
 * @param {Number} max The upper boundary of the output range
 * @returns A value in the range [min, max]
 */
function clamp(number, min, max) {
  return Math.min(Math.max(number, min), max);
}

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
