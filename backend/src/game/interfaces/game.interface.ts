import UserEntity from "src/user/models/user.entity";

interface Pad {
	x: number;
	y: number;
	w: number;
	h: number;
	speed: number;
}

interface Ball {
	x: number;
	y: number;
	radius: number;
	startAngle: number;
	speedx: number;
	speedy: number;
	goRight: boolean;
}

interface Player extends UserEntity{

}

interface Match {
	rightPad:	Pad;
	leftPad:	Pad;
	ball:			Ball;
	player1:	Player;
	player2:	Player;
}

export default Match;
