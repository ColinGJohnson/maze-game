
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
        this.ctx = this.canvas.getContext("2d");
    }

    /**
     * Resizes the canvas to match the current window size.
     *
     * @param {MazeGame} mazeGame the MazeGame to draw.
     */
    updateDimensions(mazeGame)  {

        // resize the canvas
        this.canvas.height = window.innerHeight;
        this.canvas.width = window.innerWidth;

        // get canvas dimensions
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.gridWidthPx = (this.canvas.height < this.canvas.width) ? this.canvas.height * 0.70: this.canvas.width * 0.70;
        this.cellWidthPx = this.gridWidthPx / mazeGame.maze.size;
    }

    /**
     * Draws a maze on the canvas associated with this mazerenderer.
     *
     * @param {MazeGame} mazeGame the MazeGame to draw.
     */
    render(mazeGame) {

        // update dimensions
        this.updateDimensions(mazeGame);

        // draw black background
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // draw maze grid
        let maze = mazeGame.maze;
        let mazeSize = maze.size;
        this.ctx.strokeStyle = "grey";
        this.ctx.lineWidth = 1;

        for (let i = 0; i < mazeSize + 1; i++) {

            // draw horizontal lines
            let y = Math.round((this.centerY - this.gridWidthPx / 2) + i * this.cellWidthPx) + 0.5;
            this.ctx.moveTo(this.centerX - this.gridWidthPx / 2, y);
            this.ctx.lineTo(this.centerX + this.gridWidthPx / 2, y)
            this.ctx.stroke();

            // draw vertical lines
            let x = Math.round((this.centerX - this.gridWidthPx / 2) + i * this.cellWidthPx) + 0.5;
            this.ctx.moveTo(x, this.centerY - this.gridWidthPx / 2);
            this.ctx.lineTo(x, this.centerY + this.gridWidthPx / 2);
            this.ctx.stroke();
        }

        // fill maze squares
        for (let x = 0; x < maze.size; x++) {
            for (let y = 0; y < maze.size; y++) {
                if (maze.get(x, y) !== -1) {

                    // fill with white if unvisited
                    if (maze.get(x, y) === 0) {
                        this.ctx.fillStyle = "white";

                    // cycle colors if this is the goal cell
                    } else if (maze.get(x, y) === -2) {
                        this.ctx.fillStyle = "hsl(" + (Date.now() / 10) % 360 + ", 90%, 50%)"

                    // otherwise dynamically color
                    } else {
                        let hue = 150 - maze.get(x, y) * this.colorRate;
                        hue = (hue < 0) ? 0: hue
                        this.ctx.fillStyle = "hsl(" + hue + ", 90%, 50%)"
                    }

                    let topLeft = {
                        x: this.centerX - this.gridWidthPx / 2 + x * this.cellWidthPx,
                        y: this.centerY - this.gridWidthPx / 2 + y * this.cellWidthPx
                    };

                    this.ctx.fillRect(topLeft.x, topLeft.y, this.cellWidthPx, this.cellWidthPx);
                }
            }
        }

        // if game has been started at least once
        if (mazeGame.gameState > 0) {
            let player = mazeGame.player;

            // draw player square
            this.ctx.fillStyle = "grey";
            let topLeft = {
                x: this.centerX - this.gridWidthPx / 2 + player.x * this.cellWidthPx,
                y: this.centerY - this.gridWidthPx / 2 + player.y * this.cellWidthPx
            };
            this.ctx.fillRect(topLeft.x, topLeft.y, this.cellWidthPx, this.cellWidthPx);
        }

        // if on start screen
        if (mazeGame.gameState === 0) {

            // draw instructions
            this.ctx.font = ("30px Courier New");
            this.ctx.fillStyle  = "white";
            this.ctx.fillText("SPACE to start. Arrow keys to move.", 30, 60);
        }

        // if in game
        if (mazeGame.gameState === 1) {

            // draw timer
            this.ctx.font = ("30px Courier New");
            this.ctx.fillStyle  = "white";
            let currentTimeMs = (new Date).getTime();
            let secondsPassed = (currentTimeMs - mazeGame.gameStartTimestamp) / 1000
            this.ctx.fillText(secondsPassed.toFixed(2) + "s", 30, 60);
        }

        // if on win screen
        if (mazeGame.gameState === 2) {

            // draw time taken
            this.ctx.font = ("30px Courier New");
            this.ctx.fillStyle  = "green";
            let secondsPassed = (mazeGame.gameEndTimestamp - mazeGame.gameStartTimestamp) / 1000
            this.ctx.fillText("Finished in " + secondsPassed.toFixed(2) + "s", 30, 60);
        }
    }
}

