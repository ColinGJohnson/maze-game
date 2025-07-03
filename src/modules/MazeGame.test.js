import { beforeEach, describe, expect, it, vi } from "vitest";
import MazeGame, { GameState } from "./MazeGame";
import { Key } from "./InputHandler";
import { GOAL, WALL } from "./Maze.js";

describe("MazeGame", () => {
  let mockPlayer, mockMaze, mockMazeRenderer, mockInputHandler, mazeGame;

  beforeEach(() => {
    mockPlayer = { x: 0, y: 0, mazesCompleted: 0, resetPosition: vi.fn() };
    mockMaze = {
      size: 5,
      get: vi.fn(() => 0),
      visit: vi.fn(),
    };
    mockMazeRenderer = { render: vi.fn() };
    mockInputHandler = {
      pressed: vi.fn(),
      reset: vi.fn(),
    };
    mazeGame = new MazeGame(mockPlayer, mockMaze, mockMazeRenderer, mockInputHandler);
  });

  it("initializes with correct default state", () => {
    expect(mazeGame.gameState).toBe(GameState.START);
    expect(mazeGame.gameStartTimestamp).toBe(0);
    expect(mazeGame.gameEndTimestamp).toBe(0);
    expect(mazeGame.initialMazeSize).toBe(5);
  });

  it("calls render and requestAnimationFrame in step()", () => {
    const requestAnimationFrameSpy = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation(() => {});
    mazeGame.step();
    expect(mockMazeRenderer.render).toHaveBeenCalledWith(mazeGame);
    expect(requestAnimationFrameSpy).toHaveBeenCalled();
    requestAnimationFrameSpy.mockRestore();
  });

  it("sets up a new maze and resets state in updateMenu()", () => {
    mockInputHandler.pressed.mockReturnValueOnce(true);
    mazeGame.updateMenu();
    expect(mockPlayer.resetPosition).toHaveBeenCalled();
    expect(mockInputHandler.reset).toHaveBeenCalled();
    expect(mazeGame.gameState).toBe(GameState.IN_GAME);
    expect(mazeGame.gameStartTimestamp).not.toBe(0);
    expect(mazeGame.maze.size).toBe(5);
  });

  it("handles player movement in updateGame()", () => {
    mockInputHandler.pressed.mockImplementation((key) => key === Key.RIGHT);
    mazeGame.tryMove = vi.fn();
    mazeGame.updateGame();
    expect(mazeGame.tryMove).toHaveBeenCalledWith(1, 0);
    expect(mockInputHandler.reset).toHaveBeenCalled();
  });

  it("detects win condition and updates game state in updateGame()", () => {
    mockMaze.get.mockReturnValueOnce(GOAL);
    mazeGame.updateGame();
    expect(mazeGame.gameState).toBe(GameState.END);
    expect(mazeGame.gameEndTimestamp).not.toBe(0);
    expect(mockPlayer.mazesCompleted).toBe(1);
  });

  it("moves player within maze in tryMove()", () => {
    mockMaze.get.mockImplementation((x, y) => (x === 1 && y === 0 ? 0 : WALL));
    mazeGame.tryMove(1, 0);
    expect(mockMaze.visit).toHaveBeenCalled();
    expect(mockPlayer.x).toBe(1);
    expect(mockPlayer.y).toBe(0);
  });
});
