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
	isMoving: boolean;
}

// export class Player extends UserEntity {}

export class Match {
	rightPad: Pad;
	leftPad: Pad;
	ball: Ball;
	player1: string;
	player2: string;
	// stats
	p1Score: number;
	p2Score: number;
	p1Touches: number;
	p2Touches: number;
	//end stats
	p1User: string;
	p2User: string;
	isLocal: boolean;
	//name of the associated room for sockets
	roomName: string;
	//boolean to tell if the game has ended or not
	isEnd: boolean;
}
