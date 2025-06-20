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
   * Resizes the canvas to match the current window size.
   *
   * @param {MazeGame} mazeGame the MazeGame to draw.
   */
  updateDimensions(mazeGame) {
    const container = document.querySelector(".maze-container");

    this.cellWidthPx = Math.round(container.clientWidth / mazeGame.maze.size);
    const size = this.cellWidthPx * mazeGame.maze.size;
    this.canvas.width = size;
    this.canvas.height = size;

    this.canvas.style.borderRadius = this.cellWidthPx + "px";
    this.text.style.fontSize = size / 25 + "px";
  }

  /**
   * Draws a maze on the canvas associated with this MazeRenderer.
   *
   * @param {MazeGame} mazeGame the MazeGame to draw.
   */
  render(mazeGame) {
    // update canvas dimensions in case the window was resized
    this.updateDimensions(mazeGame);

    // draw black background
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // if game has been started at least once
    if (mazeGame.gameState !== GameState.START) {
      // fill maze squares
      this.drawMaze(mazeGame);

      // draw player square
      const player = mazeGame.player;
      this.ctx.fillStyle = "grey";
      let topLeft = {
        x: Math.round(player.x * this.cellWidthPx),
        y: Math.round(player.y * this.cellWidthPx),
      };
      this.ctx.fillRect(topLeft.x, topLeft.y, this.cellWidthPx, this.cellWidthPx);
    }

    if (mazeGame.gameState === GameState.START) {
      this.text.innerHTML = "Press any key to start <br> Use WASD or arrow keys to move";
    } else if (mazeGame.gameState === GameState.IN_GAME) {
      const currentTimeMs = new Date().getTime();
      const secondsPassed = (currentTimeMs - mazeGame.gameStartTimestamp) / 1000;
      this.text.innerHTML = `<b>${secondsPassed.toFixed(2) + "s"}</b>`;
    } else if (mazeGame.gameState === GameState.END) {
      const secondsPassed = (mazeGame.gameEndTimestamp - mazeGame.gameStartTimestamp) / 1000;
      this.text.innerHTML = `Finished in <b>${secondsPassed.toFixed(2)}s</b><br>Press any key to restart`;
    }
  }

  /**
   * Renders a visual representation of the maze on the canvas.
   *
   * @param {MazeGame} mazeGame - The maze game object containing the maze data.
   */
  drawMaze(mazeGame) {
    let maze = mazeGame.maze;
    for (let x = 0; x < maze.size; x++) {
      for (let y = 0; y < maze.size; y++) {
        if (maze.get(x, y) !== -1) {
          if (maze.get(x, y) === 0) {
            // fill with white if unvisited
            this.ctx.fillStyle = "#FAF9F6";
          } else if (maze.get(x, y) === GOAL) {
            // cycle colors if this is the goal cell
            this.ctx.fillStyle = "hsl(" + ((Date.now() / 10) % 360) + ", 90%, 50%)";
          } else {
            // otherwise dynamically color
            let hue = 150 - maze.get(x, y) * this.colorRate;
            hue = hue < 0 ? 0 : hue;
            this.ctx.fillStyle = "hsl(" + hue + ", 90%, 50%)";
          }

          let topLeft = {
            x: Math.round(x * this.cellWidthPx),
            y: Math.round(y * this.cellWidthPx),
          };

          this.ctx.fillRect(topLeft.x, topLeft.y, this.cellWidthPx, this.cellWidthPx);
        }
      }
    }
  }
}
