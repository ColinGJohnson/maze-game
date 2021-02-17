'use strict';

import Maze from "./Maze.js";
import MazeRenderer from "./MazeRenderer.js";
import Player from "./Player.js";

export default class MazeGame {

	lastStamp = 0;
	gameState = 0; // 0 = start, 1 = in-game, 2 = finished

	// Game stats
	gameStartTimestamp = 0;
	gameEndTimestamp = 0;

	// maze representation
	maze = new Maze(11);
	mazeRenderer = new MazeRenderer("mainCanvas");
	player = new Player();

	// object to store keyboard information
	Key = {
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

	constructor() {

		// keyboard event listeners to modify 'Key' object
		window.addEventListener('keyup', (event) => { this.Key.onKeyup(event); }, false);
		window.addEventListener('keydown', (event) => { this.Key.onKeydown(event); }, false);

		// start the game loop
		window.requestAnimationFrame(() => this.step());
	}

	/**
	* The game loop, called repeatedly at the refresh rate of the client's monitor
	*/
	step(timeStamp) {

		// calculate millisecond time since last render
		let delta = timeStamp - this.lastStamp;

		// update controls and game logic
		this.update(delta);

		// draw the current game state
		this.mazeRenderer.render(this);

		// record timestamp of this render
		this.lastStamp = timeStamp;

		// do it all again
		window.requestAnimationFrame(() => this.step());
	}

	/**
	 * Updates game state based on current input.
	 * @param {number} delta The number of seconds which have passed since the last update.
	 */
	update(delta) {

		// if user in in-game
		if (this.gameState === 1) {

			// check win conditions
			if (this.maze.get(this.player.x, this.player.y) === -2) {
				this.gameState = 2;
				this.gameEndTimestamp = (new Date).getTime();
				this.player.mazesCompleted += 1;
			}

			let tryMove = (xOffset, yOffset) => {
				if (this.maze.get(this.player.x + xOffset, this.player.y + yOffset) !== -1) {
					this.maze.visit(this.player)
					this.player.x += xOffset;
					this.player.y += yOffset;
				}
			}

			// process input
			if (this.Key.isDown(this.Key.RIGHT)) tryMove(1, 0);
			if (this.Key.isDown(this.Key.LEFT)) tryMove(-1, 0);
			if (this.Key.isDown(this.Key.DOWN)) tryMove(0, 1);
			if (this.Key.isDown(this.Key.UP)) tryMove(0, -1);

		// otherwise user has not yet started the game
		} else {

			// start game if space is pressed
			if (this.Key.isDown([this.Key.SPACE])) {

				// increase the maze size after before every game but the first
				if (this.player.mazesCompleted > 0) {
					this.maze = new Maze(this.maze.size + 2);
				}

				// reset player position
				this.player.resetPosition();

				// let the player move
				this.gameState = 1;

				// record the start time
				this.gameStartTimestamp = (new Date).getTime();
			}
		}
	}
}
