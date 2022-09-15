/* eslint-disable prettier/prettier */
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fstat } from 'fs';
import { Socket } from 'socket.io';
import UserEntity from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Match, Pad, Ball } from './interfaces/game.interface';
import InvitationEntity from './invitations/invitations.entity';

const matchMakingSet = new Set<Socket>();
const inviteSet = new Set<Socket>();
const	inviteRoomMap = new Map<string, string>(); // <userInviting, roomId>
let match: Match;

@Injectable()
export class GameService {
	constructor(

		@InjectRepository(InvitationEntity)
		private invitationRepository: Repository<InvitationEntity>,
		@Inject(forwardRef(() => UserService)) private userService: UserService,
	) {}
	/**
	 * set the default position of the elements in the game
	 * @param match interface of the match
	 */
	setDefaultPos(room: string) {
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
			p1Touches: 0,
			p2Touches: 0,
			isMoving: false,
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
			p1Touches: 0,
			p2Touches: 0,
			p1User: null,
			p2User: null,
			isLocal: true,
			roomName: room,
			isEnd: false,
		};
		console.log(match.roomName);
		return match;
	}

	// set new position according to keyboard
	async movePad(direction: string, match: Match) {
		if (match.isLocal == true)
		{
			switch (direction) {
				case 'up':
					if (match.rightPad.y - match.rightPad.speed <= 100) {
						match.rightPad.y = 100;
					}
					else
						match.rightPad.y -= match.rightPad.speed;
					break;
				case 'down':
					if (match.rightPad.y + match.rightPad.speed >= 480) {
						match.rightPad.y = 480;
					}
					else
						match.rightPad.y += match.rightPad.speed;
					break;
			}
		}
	}

	// set new position according to mouse (for left pad only)
	async moveMouseLeft(mousePosy: number, match: Match) {
		if (mousePosy <= 100) {
			match.leftPad.y = 100;
		}
		else if (mousePosy >= 480) {
			match.leftPad.y = 480;
		}
		else
			match.leftPad.y = mousePosy;
	}

	// set new position according to mouse (for right pad only)
	async moveMouseRight(mousePosy: number, match: Match) {
		if (match.isLocal == false)
		{
			if (mousePosy <= 100) {
				match.rightPad.y = 100;
			}
			else if (mousePosy >= 480) {
				match.rightPad.y = 480;
			}
			else
				match.rightPad.y = mousePosy;
		}
	}

	// gameFunction : Switch with all functions related to the match
	async gameFunction(func: string, score: number, match: Match) {
	switch(func) {
		case "resetBall":
			match.ball.y = 250;
			match.ball.x = 250;
			match.ball.speedy = 0;
			match.ball.goRight = true;
			match.ball.isMoving = false;
		}
		switch(score) {
			case 0:
				break;
			case 1:
				match.p2Score++;
				match.ball.goRight = false;
			break;
			case 2:
				match.p1Score++;
				match.ball.goRight = true;
				break;
		}
	}

		// toggle SinglePlayer : launch the SinglePlayer
		// and disable keyboard commands
		async toggleLocalGame(client: Socket) {
			const roomName = 'room'+ Math.random();
			client.join(roomName)
			client.data.currentMatch = this.setDefaultPos(roomName);
			client.data.currentMatch.isLocal = true;
			client.data.currentMatch.p1User = client.data.user;
			client.data.currentMatch.p2User = client.data.currentMatch.p1User;
			client.data.currentMatch.player1 = client.data.currentMatch.p1User;
			client.data.currentMatch.player2 = client.data.currentMatch.p1User;
		}

	// toggle MatchMaking : launch the matchmaking
	// and disable keyboard commands
	async toggleMatchMaking(client: Socket) {
		matchMakingSet.add(client);
		console.log('set size:', matchMakingSet.size);
		if (matchMakingSet.size == 2)
		{
			const roomName = 'room'+ Math.random();
			match = this.setDefaultPos(roomName);
			for (const item of matchMakingSet)
			{
				if (match.p1User == null) {
					match.player1 = item.data.user;
					match.p1User = match.player1;
				} else if (
					match.p2User == null &&
					match.p1User != item.data.user
				) {
					match.player2 = item.data.user;
					match.p2User = match.player2;
				}
				item.join(roomName);
				match.isLocal = false;
			}
			for (const item of matchMakingSet)
			{
				item.data.currentMatch = match;
			}
			matchMakingSet.clear();
		}
	}

	//ends the game
	async endGame(match: Match, winner: UserEntity) {
		match.isEnd = true;
		if (match.isLocal == false) {
			// -> send the data to the db
			// trigger the pop-up(?modal) with victory info and home button
			console.log(winner.username, ' has won.');
			console.log(match.player2.username, ' has lost.');
		}
		else {
			// trigger the pop-up(?modal) with victory info and home button
			console.log('We have a winner !');
		}
	}
	//check if the game should end and exec the proper funciton if so
	async checkEndGame(match: Match) {
		if (match.p1Score >= 2){
			this.endGame(match, match.player1);
		}
		if (match.p2Score >= 2) {
			this.endGame(match, match.player2);
		}
	}

	/**
	 * create a room, initialize it and join it.
	 * @param client the user that sends an invitation
	 */
		async	sendInvite(client: Socket, userToInviteId: string) {
				const userToInvite: UserEntity = await this.userService.getUserById(userToInviteId);
				const invitation: InvitationEntity = await this.invitationRepository.save( {
					creator: client.data.user,
					receiver: userToInvite,
					status: 'pending'
				})
				const roomName = 'inviteRoom'+ Math.random();
				client.join(roomName);
				inviteRoomMap.set(client.data.user.userId, roomName);
		}

	/**
	 * the user accepted the invitation
	 * the user is now joining the game
	 * @param client the user accepting the invitation
	 */
		async joinInvite(client: Socket, userInvitingId: string) {
			const userInviting: UserEntity = await this.userService.getUserById(userInvitingId);
			let invitation: InvitationEntity = await this.invitationRepository.createQueryBuilder('invitation')
			.select(['invitation.requestId', 'creator'])
			.leftJoin('invitation.creator', 'creator')
			.leftJoin('invitation.receiver', 'receiver')
			.where('invitation.creator = :id', { id: userInvitingId})
			.getOne();
			const invitId: string = invitation.requestId;
			invitation = await this.invitationRepository.save({
				requestId: invitId,
				creator: userInviting,
				receiver: client.data.user,
				status: 'accepted'
			})
			const currentRoomName: string = inviteRoomMap.get(userInvitingId);
			inviteRoomMap.delete(userInvitingId);
			const currentMatch: Match = this.setDefaultPos(currentRoomName);
			currentMatch.player1 = client.data.user;
			currentMatch.p1User = currentMatch.player1;
			currentMatch.player2 = userInviting;
			currentMatch.p2User = currentMatch.player2;
			currentMatch.isLocal = false;
			client.join(currentMatch.roomName);
			client.data.user.currentMatch = currentMatch;
			userInviting.currentMatch = currentMatch;
		}

		/**
		 * cancels the invitation
		 */
		async	refuseInvite(client: Socket, userInvitingId: string) {
			const userInviting: UserEntity = await this.userService.getUserById(userInvitingId);
			let invitation: InvitationEntity = await this.invitationRepository.createQueryBuilder('invitation')
			.select(['invitation.requestId', 'creator'])
			.leftJoin('invitation.creator', 'creator')
			.leftJoin('invitation.receiver', 'receiver')
			.where('invitation.creator = :id', { id: userInvitingId})
			.getOne();
			const invitId: string = invitation.requestId;
			invitation = await this.invitationRepository.save({
				requestId: invitId,
				creator: userInviting,
				receiver: client.data.user,
				status: 'declined'
			})
			await this.invitationRepository
			.createQueryBuilder()
			.delete()
			.from(InvitationEntity)
			.where('creator = :id', { id: userInvitingId})
			.execute();
			inviteRoomMap.delete(userInvitingId);
		}

		/**
		 * tells the emitter that the invitation
		 * has been declined
		 */
		async inviteIsDeclined(client: Socket) {
			client.data.user.sentInvitations //query pour retrouver la bonne invitation
			//passer l'invit. a 'declined', la suppr
			client.leave(client.data.currentMatch.roomName);
			//end null game
		}
}
