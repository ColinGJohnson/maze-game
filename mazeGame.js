
// player
var	playerPos = {x: 1, y: 1};
var	movementOptions = {up: false, down: false, left: false, right: false};

// loop mechanics
var	lastStamp = 0;
var	gameState = 0; // 0 = start, 1 = in-game, 2 = finished

// maze representation
var	mazeSize = 21;
var colorRate = 30;
var	maze = [];
var	mazeGenerated = false;

// game stats variables
var gameStartTimestamp = 0;
var gameEndTimestamp = 0;

// object to store keyboard information
var Key = {
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

		// process input
		if (Key.isDown(Key.RIGHT) && maze[playerPos.x + 1][playerPos.y] != -1) {
			playerPos.x += 1;
			maze[playerPos.x][playerPos.y] += colorRate;
		}

		if (Key.isDown(Key.LEFT) && maze[playerPos.x - 1][playerPos.y] != -1) {
			playerPos.x -= 1;
			maze[playerPos.x][playerPos.y] += colorRate;
		}

		if (Key.isDown(Key.DOWN) && maze[playerPos.x][playerPos.y + 1] != -1) {
			playerPos.y += 1;
			maze[playerPos.x][playerPos.y] += colorRate;
		}

		if (Key.isDown(Key.UP) && maze[playerPos.x][playerPos.y - 1] != -1) {
			playerPos.y -= 1;
			maze[playerPos.x][playerPos.y] += colorRate;
		}

		// check win conditions
		if (playerPos.x == mazeSize - 2 && playerPos.y == mazeSize - 2) {
			gameState = 2;
			mazeGenerated = false;
			gameEndTimestamp = (new Date).getTime();
		}

	// otherwise user has not yet started the game
	} else {

		// start game if space is pressed
		if(Key.isDown([Key.SPACE])) {

			// generate maze if nessesary
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
	var canvas = document.getElementById("mainCanvas");
	ctx = canvas.getContext("2d");

	// resize the canvas
	canvas.height = window.innerHeight;
	canvas.width = window.innerWidth;

	// update dimensions
	var centerX = canvas.width / 2;
	var centerY = canvas.height / 2;
	var gridWidthPx = (canvas.height < canvas.width) ? canvas.height * 0.70: canvas.width * 0.70;
	var cellWidthPx = gridWidthPx / mazeSize;

	// draw black background
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// draw maze grid
	ctx.strokeStyle = "grey";
	ctx.lineWidth = 1;
	for (var i = 0; i < mazeSize + 1; i++) {
		
		// draw horizontal lines
		var y = Math.round((centerY - gridWidthPx / 2) + i * cellWidthPx) + 0.5;
		ctx.moveTo(centerX - gridWidthPx / 2, y);
		ctx.lineTo(centerX + gridWidthPx / 2, y)
		ctx.stroke();

		// draw vertical lines
		var x = Math.round((centerX - gridWidthPx / 2) + i * cellWidthPx) + 0.5;
		ctx.moveTo(x, centerY - gridWidthPx / 2);
		ctx.lineTo(x, centerY + gridWidthPx / 2);
		ctx.stroke();
	}

	// fill maze squares
	for (var x = 0; x < maze.length; x++) {
		for (var y = 0; y < maze.length; y++) {
			if (maze[x][y] > -1) {

				// fill with white if unvisited
				if (maze[x][y] == 0){
					ctx.fillStyle = "white";

				// otherwise dynamically color
				} else {
					var hue = 150 - maze[x][y]
					hue = (hue < 0) ? 0: hue
					ctx.fillStyle = "hsl(" + hue + ", 90%, 50%)"
				}
				
				var topLeft = {
					x: centerX - gridWidthPx / 2 + x * cellWidthPx, 
					y: centerY - gridWidthPx / 2 + y * cellWidthPx
				};
				ctx.fillRect(topLeft.x, topLeft.y, cellWidthPx, cellWidthPx);
			}
		}
	}

	// if game has been started at least once
	if (gameState > 0) {
		
		// draw color cycling finish square
		ctx.fillStyle = "hsl(" + (Date.now() / 10) % 360 + ", 90%, 50%)"
		var topLeft = {
			x: centerX - gridWidthPx / 2 + cellWidthPx * (mazeSize - 2), 
			y: centerY - gridWidthPx / 2 + cellWidthPx * (mazeSize - 2)
		};
		ctx.fillRect(topLeft.x, topLeft.y, cellWidthPx, cellWidthPx);

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
		var currentTimeMs = (new Date).getTime();
		var secondsPassed = (currentTimeMs - gameStartTimestamp) / 1000
		ctx.fillText(secondsPassed.toFixed(2) + "s", 30, 60);
	}

	// if on win screen
	if (gameState == 2) {

		// draw time taken
		ctx.font = ("30px Courier New");
		ctx.fillStyle  = "green";
		var secondsPassed = (gameEndTimestamp - gameStartTimestamp) / 1000
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
	var mazeArray = newMaze(mazeSize);

	/* 
	* function to randomly select a coordinate to proceed to given a partially completed
	* maze and a coordinate to proceed from
	*/
	chooseNext = function(mazeArray, x, y) {
		var options = [];
		var jumpDist = 2

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
	var genStack = [{x: 1, y: 1}];

	// continute generating until backtracking is complete
	while (genStack.length > 0) {
		
		// get current cell by peeking stack
		var current = genStack[genStack.length - 1]

		// mark current cell as visited (0) in mazeArray
		mazeArray[current.x][current.y] = 0;

		// mark cell between current and last as visited (0)
		if (genStack.length > 1) {
			var previous = genStack[genStack.length - 2]

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
		var next = chooseNext(mazeArray, current.x, current.y);

		if (next) {
			genStack.push(next);

		// otherwise backtrack
		} else {
			genStack.pop();
		}
	}

	return mazeArray
}