import Maze, { GOAL, WALL } from "./Maze.js";
import { Key } from "./InputHandler.js";

const MAX_MAZE_SIZE = 201;

export const GameState = Object.freeze({
  START: 0,
  IN_GAME: 1,
  END: 2,
});

export default class MazeGame {
  gameState = GameState.START;
  gameStartTimestamp = 0;
  gameEndTimestamp = 0;

  constructor(player, maze, mazeRenderer, inputHandler) {
    this.player = player;
    this.maze = maze;
    this.mazeRenderer = mazeRenderer;
    this.inputHandler = inputHandler;
    this.initialMazeSize = maze.size;
  }

  play() {
    window.requestAnimationFrame(() => this.step());
  }

  /**
   * The game loop, called repeatedly at the refresh rate of the client's monitor.
   */
  step() {
    if (this.gameState === GameState.START || this.gameState === GameState.END) {
      this.updateMenu();
    } else if (this.gameState === GameState.IN_GAME) {
      this.updateGame();
    } else {
      throw new Error(`Invalid game state: ${this.gameState}`);
    }

    this.mazeRenderer.render(this);
    window.requestAnimationFrame(() => this.step());
  }

  /**
   * Wait to start the game until the space bar is pressed.
   */
  updateMenu() {
    if (this.inputHandler.pressed(Key.SPACE)) {
      this.#startGame();
    }
  }

  /**
   * Updates the game state by checking win conditions, processing player movement,
   * and handling input.
   */
  updateGame() {
    this.#checkWinCondition();

    if (this.inputHandler.pressed(Key.RIGHT) || this.inputHandler.pressed(Key.D)) {
      this.tryMove(1, 0);
    }

    if (this.inputHandler.pressed(Key.LEFT) || this.inputHandler.pressed(Key.A)) {
      this.tryMove(-1, 0);
    }

    if (this.inputHandler.pressed(Key.DOWN) || this.inputHandler.pressed(Key.S)) {
      this.tryMove(0, 1);
    }

    if (this.inputHandler.pressed(Key.UP) || this.inputHandler.pressed(Key.W)) {
      this.tryMove(0, -1);
    }

    this.inputHandler.reset();
  }

  /**
   * Attempts to move the player in the specified direction within the maze. The player
   * continues moving along the provided direction until a wall is encountered or a junction
   * (with open paths) is reached.
   *
   * @param {number} x - The x-direction movement. Positive values for right, negative for left.
   * @param {number} y - The y-direction movement. Positive values for down, negative for up.
   */
  tryMove(x, y) {
    while (this.maze.get(this.player.x + x, this.player.y + y) !== WALL) {
      this.maze.visit(this.player);

      this.player.x += x;
      this.player.y += y;

      const openLeft = this.maze.get(this.player.x + y, this.player.y + x) !== WALL;
      const openRight = this.maze.get(this.player.x - y, this.player.y - x) !== WALL;

      if (openLeft || openRight) {
        break;
      }
    }
  }

  #startGame() {
    const nextMazeSize = Math.min(
      MAX_MAZE_SIZE,
      this.initialMazeSize + this.player.mazesCompleted * 4,
    );
    this.maze = new Maze(nextMazeSize);
    this.inputHandler.reset();
    this.player.resetPosition();
    this.gameState = GameState.IN_GAME;
    this.gameStartTimestamp = new Date().getTime();
  }

  /**
   * Checks if the player has reached the goal and updates game state accordingly.
   */
  #checkWinCondition() {
    if (this.maze.get(this.player.x, this.player.y) === GOAL) {
      this.gameState = GameState.END;
      this.gameEndTimestamp = new Date().getTime();
      this.player.mazesCompleted += 1;
    }
  }
}
