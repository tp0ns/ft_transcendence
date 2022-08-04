import { Injectable } from '@nestjs/common';
import UserEntity from 'src/user/models/user.entity';
import { Match, Pad, Ball, Player } from './interfaces/game.interface';

@Injectable()
export class GameService {
	/**
	 * set the default position of the elements in the game
	 * @param match interface of the match
	 */
	async setDefaultPos(): Promise<Match> {
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
		// // set left paddle
		// match.leftPad.x = 0;
		// match.leftPad.y = 50;
		// match.leftPad.w = 20;
		// match.leftPad.h = 100;
		// match.leftPad.speed = 5;
		// // set right paddle
		// match.rightPad.x = 620;
		// match.rightPad.y = 200;
		// match.rightPad.w = 20;
		// match.rightPad.h = 100;
		// match.rightPad.speed = 20; //speed = 20 si keyboard, 5 si mouse
		// // set ball position
		// match.ball.x = 250;
		// match.ball.y = 250;
		// match.ball.radius = 10;
		// match.ball.startAngle = 0;
		// match.ball.speedx = 5;
		// match.ball.speedy = 0;
		// match.ball.goRight = false;
		return match;
	}
}
