import { Injectable } from '@nestjs/common';
import UserEntity from 'src/user/models/user.entity';
import { Match, Pad, Ball, Player } from './interfaces/game.interface';

@Injectable()
export class GameService {
	/**
	 * set the default position of the elements in the game
	 * @param match interface of the match
	 */
	setDefaultPos() {
		const initLeftPad: Pad = {
			x: 0,
			y: 50,
			w: 20,
			h: 100,
			speed: 5,
		};
		const initRightPad: Pad = {
			// set right paddle
			x: 620,
			y: 200,
			w: 20,
			h: 100,
			speed: 20, //speed = 20 si keyboard, 5 si mouse
		};
		const initBall: Ball = {
			// set ball position
			x: 250,
			y: 250,
			radius: 10,
			startAngle: 0,
			speedx: 5,
			speedy: 0,
			goRight: false,
		};
		let initPlayer: UserEntity; // check if this init is good

		//init match using all the other class initialized
		const match: Match = {
			leftPad: initLeftPad,
			rightPad: initRightPad,
			ball: initBall,
			player1: initPlayer,
			player2: initPlayer,
		};
		return match;
	}
}
