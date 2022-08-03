import { Injectable } from '@nestjs/common';
import Match from './interfaces/game.interface';

@Injectable()
export class GameService {
	/**
	 * set the default position of the elements in the game
	 * @param match interface of the match
	 */
	async setDefaultPos(match: Match): Promise<Match> {
		// set left paddle
		match.leftPad.x = 0;
		match.leftPad.y = 50;
		match.leftPad.w = 20;
		match.leftPad.h = 100;
		match.leftPad.speed = 5;
		// set right paddle
		match.rightPad.x = 620;
		match.rightPad.y = 200;
		match.rightPad.w = 20;
		match.rightPad.h = 100;
		match.rightPad.speed = 20; //speed = 20 si keyboard, 5 si mouse
		// set ball position
		match.ball.x = 250;
		match.ball.y = 250;
		match.ball.radius = 10;
		match.ball.startAngle = 0;
		match.ball.speedx = 5;
		match.ball.speedy = 0;
		match.ball.goRight = false;
		return match;
	}
}
