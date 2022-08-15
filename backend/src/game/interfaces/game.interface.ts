import UserEntity from 'src/user/models/user.entity';

export class Pad {
	x: number;
	y: number;
	w: number;
	h: number;
	speed: number;
}

export class Ball {
	x: number;
	y: number;
	radius: number;
	startAngle: number;
	speedx: number;
	speedy: number;
	goRight: boolean;
	p1Touches: number;
	p2Touches: number;
}

export class Player extends UserEntity {}

export class Match {
	rightPad: Pad;
	leftPad: Pad;
	ball: Ball;
	player1: Player;
	player2: Player;
	// stats
	p1Score: number;
	p2Score: number;
	p1Touches: number;
	p2Touches: number;
	//end stats
	p1User: UserEntity;
	p2User: UserEntity;
	isLocal: boolean;
}
