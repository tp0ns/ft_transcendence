import UserEntity from "src/user/models/user.entity";

export class Coordinate {
	x: number;
	y: number;
}

export class Pad {
	pos: Coordinate;
	size: Coordinate;
}

export class Ball {
	pos: Coordinate;
	radius: number;
}

export class Grid {
	ball: Ball;
	pads: Pad[];
}

export class Canvas {
	grid: Grid;
}

export class Player {
	user: UserEntity;
	score: number;
}

export class Game {
	id: number;
	canvas: Canvas;
	player1: Player;
	player2: Player;
}
