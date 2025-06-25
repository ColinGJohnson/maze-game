import Maze, { GOAL, WALL } from "./Maze.js";
import MazeRenderer from "./MazeRenderer.js";
import Player from "./Player.js";
import InputHandler, { Key } from "./InputHandler.js";

const INITIAL_MAZE_SIZE = 11;

export const GameState = Object.freeze({
  START: 0,
  IN_GAME: 1,
  END: 2,
});

export default class MazeGame {
  gameState = GameState.START;
  gameStartTimestamp = 0;
  gameEndTimestamp = 0;
  maze = new Maze(INITIAL_MAZE_SIZE);
  mazeRenderer = new MazeRenderer("maze");
  player = new Player();
  inputHandler = new InputHandler();

  /**
   * Starts the game loop.
   */
  constructor() {
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
    if (this.inputHandler.isDown(Key.SPACE)) {
      this.startGame();
    }
  }

  startGame() {
    this.maze = new Maze(INITIAL_MAZE_SIZE + this.player.mazesCompleted * 2);
    this.inputHandler.reset();
    this.player.resetPosition();
    this.gameState = GameState.IN_GAME;
    this.gameStartTimestamp = new Date().getTime();
  }

  /**
   * Updates the game state by checking win conditions, processing player movement, and handling input.
   */
  updateGame() {
    this.checkWinCondition();

    if (this.inputHandler.isDown(Key.RIGHT) || this.inputHandler.isDown(Key.D)) {
      this.tryMove(1, 0);
    }

    if (this.inputHandler.isDown(Key.LEFT) || this.inputHandler.isDown(Key.A)) {
      this.tryMove(-1, 0);
    }

    if (this.inputHandler.isDown(Key.DOWN) || this.inputHandler.isDown(Key.S)) {
      this.tryMove(0, 1);
    }

    if (this.inputHandler.isDown(Key.UP) || this.inputHandler.isDown(Key.W)) {
      this.tryMove(0, -1);
    }

    this.inputHandler.reset();
  }

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

  /**
   * Checks if the player has reached the goal and updates game state accordingly.
   */
  checkWinCondition() {
    if (this.maze.get(this.player.x, this.player.y) === GOAL) {
      this.gameState = GameState.END;
      this.gameEndTimestamp = new Date().getTime();
      this.player.mazesCompleted += 1;
    }
  }
}
