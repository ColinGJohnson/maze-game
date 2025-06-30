import { beforeEach, describe, expect, it, vi } from "vitest";
import MazeRenderer from "./MazeRenderer";
import { GameState } from "./MazeGame.js";
import { WALL } from "./Maze.js";

describe("MazeRenderer", () => {
  let canvasMock;
  let textMock;
  let getContextMock;
  let mazeRenderer;

  beforeEach(() => {
    textMock = { style: { fontSize: "" } };
    canvasMock = { getContext: vi.fn(), style: {} };
    getContextMock = { fillRect: vi.fn(), fillStyle: "" };
    canvasMock.getContext.mockReturnValue(getContextMock);

    document.getElementById = vi.fn((id) => (id === "game-text" ? textMock : canvasMock));
    document.querySelector = vi.fn().mockReturnValue({ clientWidth: 500 });

    mazeRenderer = new MazeRenderer("canvas-id");
  });

  it("initializes canvas and text elements", () => {
    expect(document.getElementById).toHaveBeenCalledWith("canvas-id");
    expect(document.getElementById).toHaveBeenCalledWith("game-text");
    expect(mazeRenderer.canvas).toBe(canvasMock);
    expect(mazeRenderer.text).toBe(textMock);
    expect(mazeRenderer.ctx).toBe(getContextMock);
  });

  it("renders the start state", () => {
    mazeRenderer.render(mockMazeGame(GameState.START));
  });

  it("renders the in-game state", () => {
    mazeRenderer.render(mockMazeGame(GameState.IN_GAME));
  });

  it("renders the end state", () => {
    mazeRenderer.render(mockMazeGame(GameState.END));
  });
});

function mockMazeGame(gameState) {
  return {
    maze: {
      size: 10,
      get: vi.fn().mockReturnValue(WALL),
    },
    player: {
      mazesCompleted: 0,
    },
    gameState: gameState,
  };
}
