/*
"Maze Game" is a vanilla javascript browser game about solving mazes.
Copyright (C) 2020  Colin Johnson

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

// player
let playerPos = {x: 1, y: 1};
let movementOptions = {up: false, down: false, left: false, right: false};

// loop mechanics
let lastStamp = 0;
let gameState = 0; // 0 = start, 1 = in-game, 2 = finished

// maze representation
let mazeSize = 11;
let colorRate = 30;
let maze = [];
let mazeGenerated = false;

// number of Mazes that have been completed so far
let numGames = 0

// Game stats
let gameStartTimestamp = 0;
let gameEndTimestamp = 0;

// object to store keyboard information
let Key = {
    _pressed: {},
    _typed: {},

    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    SPACE: 32,

    isDown: function(keyCode) {
        return this._pressed[keyCode];
    },

    wasDown: function(keyCode) {
    	if (this.pressed[keyCode]) {
    		return true;
    	}
    },

    onKeydown: function(event) {
        this._pressed[event.keyCode] = true;
    },

    onKeyup: function(event) {
        delete this._pressed[event.keyCode];
        this._typed[event.keyCode] = true;
    }
};

// keyboard event listeners to modify 'Key' object
window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

// start game loop when window loads
window.onload = function init() {
	window.requestAnimationFrame(step);
}

/**
* The game loop, called repeatedly at the refresh rate of the client's monitor
*/
function step(timeStamp) {

	// calculate millisecond time since last render
	delta = timeStamp - lastStamp;

	// update controls and game logic
	update(delta);

	// draw the current game state
	render();

	// record timestamp of this render
	lastStamp = timeStamp;

	// do it all again
	window.requestAnimationFrame(step);
}

/*
* Updates game logic
* @param delta The number of seconds which have passed since the last update
*/
function update(delta) {

	// if user in in-game
	if (gameState == 1) {

		// check win conditions
		if (maze[playerPos.x][playerPos.y] == -2) {
			gameState = 2;
			mazeGenerated = false;
			gameEndTimestamp = (new Date).getTime();
			numGames += 1;
		}

		// process input
		if (Key.isDown(Key.RIGHT) && maze[playerPos.x + 1][playerPos.y] != -1) {
			maze[playerPos.x][playerPos.y] += colorRate;
			playerPos.x += 1;
		}

		if (Key.isDown(Key.LEFT) && maze[playerPos.x - 1][playerPos.y] != -1) {
			maze[playerPos.x][playerPos.y] += colorRate;
			playerPos.x -= 1;
		}

		if (Key.isDown(Key.DOWN) && maze[playerPos.x][playerPos.y + 1] != -1) {
			maze[playerPos.x][playerPos.y] += colorRate;
			playerPos.y += 1;
		}

		if (Key.isDown(Key.UP) && maze[playerPos.x][playerPos.y - 1] != -1) {
			maze[playerPos.x][playerPos.y] += colorRate;
			playerPos.y -= 1;
		}

	// otherwise user has not yet started the game
	} else {

		// start game if space is pressed
		if(Key.isDown([Key.SPACE])) {

			// increase the maze size after before every game but the first
			if (numGames > 0) {
				mazeSize += 2;
			}

			// generate maze if necessary
			if (!mazeGenerated) {
				maze = generate(mazeSize);
			}
			mazeGenerated = true;

			// reset player position
			playerPos = {x: 1, y: 1}

			// let the player move
			gameState = 1;

			// record the start time
			gameStartTimestamp = (new Date).getTime();
		}
	}
} // end of function "update()"

/*
* Draws the game on #mainCanvas
*/
function render() {

	// get the canvas
	let canvas = document.getElementById("mainCanvas");
	ctx = canvas.getContext("2d");

	// resize the canvas
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;

	// update dimensions
	let centerX = canvas.width / 2;
	let centerY = canvas.height / 2;
	let gridWidthPx = (canvas.height < canvas.width) ? canvas.height * 0.70: canvas.width * 0.70;
	let cellWidthPx = gridWidthPx / mazeSize;

	// draw black background
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw maze grid
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 1;
	for (let i = 0; i < mazeSize + 1; i++) {
		
		// draw horizontal lines
		let y = Math.round((centerY - gridWidthPx / 2) + i * cellWidthPx) + 0.5;
		ctx.moveTo(centerX - gridWidthPx / 2, y);
		ctx.lineTo(centerX + gridWidthPx / 2, y)
		ctx.stroke();

		// draw vertical lines
		let x = Math.round((centerX - gridWidthPx / 2) + i * cellWidthPx) + 0.5;
		ctx.moveTo(x, centerY - gridWidthPx / 2);
		ctx.lineTo(x, centerY + gridWidthPx / 2);
		ctx.stroke();
	}

	// fill maze squares
	for (let x = 0; x < maze.length; x++) {
		for (let y = 0; y < maze.length; y++) {
			if (maze[x][y] != -1) {

				// fill with white if unvisited
				if (maze[x][y] == 0) {
					ctx.fillStyle = "white";

				// cycle colors if this is the goal cell
				} else if (maze[x][y] == -2) {
					ctx.fillStyle = "hsl(" + (Date.now() / 10) % 360 + ", 90%, 50%)"

				// otherwise dynamically color
				} else {
					let hue = 150 - maze[x][y]
					hue = (hue < 0) ? 0: hue
					ctx.fillStyle = "hsl(" + hue + ", 90%, 50%)"
				}
				
				let topLeft = {
					x: centerX - gridWidthPx / 2 + x * cellWidthPx, 
					y: centerY - gridWidthPx / 2 + y * cellWidthPx
				};
				ctx.fillRect(topLeft.x, topLeft.y, cellWidthPx, cellWidthPx);
			}
		}
	}

	// if game has been started at least once
	if (gameState > 0) {

		// draw player square
		ctx.fillStyle = "grey";
		topLeft = {
			x: centerX - gridWidthPx / 2 + playerPos.x * cellWidthPx, 
			y: centerY - gridWidthPx / 2 + playerPos.y * cellWidthPx
		};
		ctx.fillRect(topLeft.x, topLeft.y, cellWidthPx, cellWidthPx);
	}

	// if on start screen
	if (gameState == 0) {

		// draw istructions
		ctx.font = ("30px Courier New");
		ctx.fillStyle  = "white";
		ctx.fillText("SPACE to start. Arrow keys to move.", 30, 60);
	}

	// if in game
	if (gameState == 1) {

		// draw timer
		ctx.font = ("30px Courier New");
		ctx.fillStyle  = "white";
		let currentTimeMs = (new Date).getTime();
		let secondsPassed = (currentTimeMs - gameStartTimestamp) / 1000
		ctx.fillText(secondsPassed.toFixed(2) + "s", 30, 60);
	}

	// if on win screen
	if (gameState == 2) {

		// draw time taken
		ctx.font = ("30px Courier New");
		ctx.fillStyle  = "green";
		let secondsPassed = (gameEndTimestamp - gameStartTimestamp) / 1000
		ctx.fillText("Finished in " + secondsPassed.toFixed(2) + "s", 30, 60);
	}
} // end of function "render()"

/**
* Fills the maze Array with -1's (representing unfilled squares)
* @param mazeSize The edge length of the square array to be generated.
* @return mazeArray A 2D array of the specified size filled with -1's
*/
function newMaze(mazeSize) {

	// create new 2D array to store the maze and fill with -1's
	return Array(mazeSize).fill().map(() => Array(mazeSize).fill(-1));
}

/*
* Iteratively generates a random maze through backtracking.
* @return mazeArray A two-dimensional array of integers representing the maze.
* @param mazeSize The edge length of the maze to be generated.
*/
function generate(mazeSize) {

	// clear the maze
	let mazeArray = newMaze(mazeSize);

	/* 
	* function to randomly select a coordinate to proceed to given a partially completed
	* maze and a coordinate to proceed from
	*/
	chooseNext = function(mazeArray, x, y) {
		let options = [];
		let jumpDist = 2

		// up
		if (y > jumpDist && mazeArray[x][y - jumpDist] == -1) {
			options.push({x: x, y: y - jumpDist});
		}

		// down
		if (y < mazeArray.length - 1 && mazeArray[x][y + jumpDist] == -1) {
			options.push({x: x, y: y + jumpDist});
		}

		// left
		if (x > jumpDist && mazeArray[x - jumpDist][y] == -1) {
			options.push({x: x - jumpDist, y: y});
		} 

		// right
		if (x < mazeArray.length - jumpDist && mazeArray[x + jumpDist][y] == -1) {
			options.push({x: x + jumpDist, y: y});
		}

		// return a random direction or undefined if no valid directions exist
		return (options.length == 0) ? undefined : options[Math.floor(Math.random() * options.length)];
	}

	// start at 1,1
	let genStack = [{x: 1, y: 1}];

	let furthestCell = {x: 1, y: 1};
	let maxStack = 0;

	// continute generating until backtracking is complete
	while (genStack.length > 0) {
		
		// get current cell by peeking stack
		let current = genStack[genStack.length - 1]

		// mark current cell as visited (0) in mazeArray
		mazeArray[current.x][current.y] = 0;

		// check if this is the new furthest cell from 1,1
		if (genStack.length > maxStack) {
			furthestCell = current;
			maxStack = genStack.length;
		} 

		// mark cell between current and last as visited (0)
		if (genStack.length > 1) {
			let previous = genStack[genStack.length - 2]

			// from left to right
			if (current.x > previous.x) {
				mazeArray[current.x - 1][current.y] = 0;

			// from right to left
			} else if (current.x < previous.x) {
				mazeArray[current.x + 1][current.y] = 0;

			// from above to below
			} else if (current.y > previous.y) {
				mazeArray[current.x][current.y - 1] = 0;

			// from below to above
			} else {
				mazeArray[current.x][current.y + 1] = 0;
			}
		}

		// proceed to an adjacent unvisited cell if one exists
		let next = chooseNext(mazeArray, current.x, current.y);

		if (next) {
			genStack.push(next);

		// otherwise backtrack
		} else {
			genStack.pop();
		}
	}

	// mark the furthest cell from (1,1), which will be the goal
	mazeArray[furthestCell.x][furthestCell.y] = -2

	return mazeArray
}