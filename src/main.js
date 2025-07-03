import MazeGame from "./modules/MazeGame.js";
import Player from "./modules/Player.js";
import Maze from "./modules/Maze.js";
import MazeRenderer from "./modules/MazeRenderer.js";
import InputHandler from "./modules/InputHandler.js";

// create and start a new maze game when the window loads
window.onload = function init() {
  const mazeGame = new MazeGame(
    new Player(),
    new Maze(13),
    new MazeRenderer("maze"),
    new InputHandler(),
  );
  mazeGame.play();
};
