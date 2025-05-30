import Maze from "./Maze.js";
import MazeRenderer from "./MazeRenderer.js";
import Player from "./Player.js";
import InputHandler from "./InputHandler.js";

export const GameState = Object.freeze({
  START: 0,
  IN_GAME: 1,
  END: 2,
});

export default class MazeGame {
  gameState = GameState.START;

  // Game stats
  gameStartTimestamp = 0;
  gameEndTimestamp = 0;

  // Maze representation
  maze = new Maze(51);
  mazeRenderer = new MazeRenderer("maze-canvas");
  player = new Player();
  inputHandler = new InputHandler();

  constructor() {
    // Start the game loop
    window.requestAnimationFrame(() => this.step());
  }

  /**
   * The game loop, called repeatedly at the refresh rate of the client's monitor
   */
  step() {
    if (this.gameState === GameState.IN_GAME) {
      this.updateGame();
    } else {
      this.updateMenu();
    }

    this.mazeRenderer.render(this);
    window.requestAnimationFrame(() => this.step());
  }

  /**
   * Updates the game menu state and prepares the game to start or continue.
   */
  updateMenu() {
    // Do nothing until the user requests to start the game
    if (!this.inputHandler.isDown(this.inputHandler.SPACE)) {
      return;
    }

    // Increase the maze size before every game but the first
    if (this.player.mazesCompleted > 0) {
      this.maze = new Maze(this.maze.size + 2);
    }

    // Reset player position
    this.player.resetPosition();

    // Let the player move
    this.gameState = GameState.IN_GAME;

    // Record the start time
    this.gameStartTimestamp = new Date().getTime();
  }

  /**
   * Updates the game state by checking win conditions, processing player movement, and handling input.
   */
  updateGame() {
    // Check win conditions
    if (this.maze.get(this.player.x, this.player.y) === -2) {
      this.gameState = GameState.END;
      this.gameEndTimestamp = new Date().getTime();
      this.player.mazesCompleted += 1;
    }

    const tryMove = (xOffset, yOffset) => {
      while (
        this.maze.get(this.player.x + xOffset, this.player.y + yOffset) !== -1
      ) {
        this.maze.visit(this.player);
        this.player.x += xOffset;
        this.player.y += yOffset;
      }
    };

    if (this.inputHandler.isDown(this.inputHandler.RIGHT)) tryMove(1, 0);
    if (this.inputHandler.isDown(this.inputHandler.LEFT)) tryMove(-1, 0);
    if (this.inputHandler.isDown(this.inputHandler.DOWN)) tryMove(0, 1);
    if (this.inputHandler.isDown(this.inputHandler.UP)) tryMove(0, -1);
  }
}
