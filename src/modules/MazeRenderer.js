import { GameState } from "./MazeGame.js";
import { GOAL } from "./Maze.js";

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
      this.drawPlayer(mazeGame.player);
    }

    this.text.innerHTML = this.getTopText(mazeGame);
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
   * Draws the player on the canvas within the maze game.
   *
   * @param {Player} player - The maze game object containing the player's information.
   */
  drawPlayer(player) {
    this.ctx.fillStyle = "grey";
    const topLeft = {
      x: Math.round(player.x * this.cellWidthPx),
      y: Math.round(player.y * this.cellWidthPx),
    };
    this.ctx.fillRect(topLeft.x, topLeft.y, this.cellWidthPx, this.cellWidthPx);
  }

  /**
   * Renders a visual representation of the maze on the canvas.
   *
   * @param {MazeGame} mazeGame - The maze game object containing the maze data.
   */
  drawMaze(mazeGame) {
    const maze = mazeGame.maze;

    const fadeTime = 1500;
    const timeSinceStart = Date.now() - mazeGame.gameStartTimestamp;
    const fadeAlpha = Math.min(1, timeSinceStart / fadeTime);

    for (let x = 0; x < maze.size; x++) {
      for (let y = 0; y < maze.size; y++) {
        if ((x + y) / (maze.size * 2) > fadeAlpha) {
          continue;
        }

        if (maze.get(x, y) === -1) {
          continue;
        }

        const topLeft = {
          x: Math.round(x * this.cellWidthPx),
          y: Math.round(y * this.cellWidthPx),
        };

        this.ctx.fillStyle = this.getCellColor(maze, x, y);
        this.ctx.fillRect(topLeft.x, topLeft.y, this.cellWidthPx, this.cellWidthPx);
      }
    }
  }

  /**
   * Determines the color of a specific cell in the maze based on its value:
   *  - Fill with white if unvisited
   *  - Cycle colors if this is the goal cell
   *  - Otherwise dynamically color
   */
  getCellColor(maze, x, y) {
    if (maze.get(x, y) === 0) {
      return "#FAF9F6";
    } else if (maze.get(x, y) === GOAL) {
      return "hsl(" + ((Date.now() / 10) % 360) + ", 90%, 50%)";
    } else {
      let hue = 150 - maze.get(x, y) * this.colorRate;
      hue = hue < 0 ? 0 : hue;
      return "hsl(" + hue + ", 90%, 50%)";
    }
  }

  /**
   * @param {MazeGame} mazeGame - The maze game object containing game state information.
   * @param {string} text - The default text to display if no game state text applies.
   * @returns {string} The text to display based on the current game state:
   *   - At start: Shows instructions to start and movement controls
   *   - During game: Shows elapsed time in seconds
   *   - At end: Shows completion time and restart instructions
   */
  getTopText(mazeGame, text) {
    if (mazeGame.gameState === GameState.START) {
      text = "Press the space bar to start <br> Use WASD or arrow keys to move";
    } else if (mazeGame.gameState === GameState.IN_GAME) {
      const currentTimeMs = new Date().getTime();
      const secondsPassed = (currentTimeMs - mazeGame.gameStartTimestamp) / 1000;
      text = `<b>${secondsPassed.toFixed(2) + "s"}</b>`;
    } else if (mazeGame.gameState === GameState.END) {
      const secondsPassed = (mazeGame.gameEndTimestamp - mazeGame.gameStartTimestamp) / 1000;
      text = `Finished in <b style="color: #13EF0C">${secondsPassed.toFixed(2)}s</b><br>Press any key to restart`;
    }
    return text;
  }
}
