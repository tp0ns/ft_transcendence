/* eslint-disable prettier/prettier */
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
			y: 150,
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
			p1Score: 0,
			p2Score: 0,
		};
		return match;
	}

	// set new position according to keyboard
	async movePad(direction: string, match: Match) {
		switch (direction) {
			case 'up':
				if (match.rightPad.y - match.rightPad.speed < 50) {
					match.rightPad.y = 50;
				}
				else
					match.rightPad.y -= match.rightPad.speed;
				break;
			case 'down':
				if (match.rightPad.y + match.rightPad.speed >= 433) {
					match.rightPad.y = 433;
				}
				else
					match.rightPad.y += match.rightPad.speed;
				break;
		}
	}

	// set new position according to mouse (for left pad only)
	async moveMouse(mousePosy: number, match: Match) {
		if (mousePosy <= 0 + 100) {
			match.leftPad.y = 0 + 100;
		}
		else if (mousePosy >= 480) {
			match.leftPad.y = 480;
		}
		else
			match.leftPad.y = mousePosy;
	}

	// gameFunction : Switch with all functions related to the match
	async gameFunction(func: string, score: number, match: Match) {
	switch(func) {
		case "resetBall":
			match.ball.y = 250;
			match.ball.x = 250;
			match.ball.speedy = 0;
			match.ball.goRight = true;
		}
		switch(score) {
			case 0:
				break;
			case 1:
				match.p2Score++;
				break;
			case 2:
				match.p1Score++;
				break;
		}
	}
}
