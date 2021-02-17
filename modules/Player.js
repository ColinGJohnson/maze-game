
/**
 * A player in a maze.
 */
export default class Player {
    mazesCompleted = 0;
    x = 1;
    y = 1;

    movementOptions = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    constructor() {
        this.resetPosition()
    }

    resetPosition() {
        this.x = 1;
        this.y = 1;
    }
}
