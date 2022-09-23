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
	pad1: Pad;
	pad2: Pad;
	size: Coordinate;
}

export class Player {
	user: UserEntity;
	score: number;
}

export class Game {
	id: string;
	grid: Grid;
	player1: Player;
	player2: Player;
	ongoing: boolean;
}
