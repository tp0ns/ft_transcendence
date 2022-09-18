/* eslint-disable prettier/prettier */
import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fstat } from 'fs';
import { Socket } from 'socket.io';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Match, Pad, Ball } from './interfaces/game.interface';
import InvitationEntity from './invitations/invitations.entity';
import { AchievementsEntity } from './statistics/achievements.entity';

const matchMakingSet = new Set<Socket>();
const inviteSet = new Set<Socket>();
const	inviteRoomMap = new Map<string, string>(); // <userInviting, roomId>
let match: Match;

@Injectable()
export class GameService {
	constructor(

		@InjectRepository(UserEntity)
		private userRepo: Repository<UserEntity>,
		@InjectRepository(InvitationEntity)
		private invitationRepository: Repository<InvitationEntity>,
		@InjectRepository(AchievementsEntity)
		private AchievementsRepository: Repository<AchievementsEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
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

		//init match using all the other class initialized
		const match: Match = {
			leftPad: initLeftPad,
			rightPad: initRightPad,
			ball: initBall,
			player1: null,
			player2: null,
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
		// console.log(match.roomName);
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
			client.data.currentMatch.p1User = client.data.user.userId;
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
			let user1: UserEntity;
			let user2: UserEntity;
			for (const item of matchMakingSet)
			{
				if (user1 == null){
					user1 = item.data.user;
				}
				else{
					user2 = item.data.user;
				}
			}
			if (user1.userId == user2.userId){
				matchMakingSet.clear();
				return false;
			}
			const roomName = 'room'+ Math.random();
			match = this.setDefaultPos(roomName);
			for (const item of matchMakingSet)
			{
				if (match.p1User == null) {
					match.player1 = item.data.user.userId;
					match.p1User = match.player1;
				} else if (
					match.p2User == null &&
					match.p1User != item.data.user.userId
				) {
					match.player2 = item.data.user.userId;
					match.p2User = match.player2;
				}
				item.join(roomName);
				match.isLocal = false;
			}
			for (const item of matchMakingSet)
			{
				item.data.currentMatch = match;
				item.data.user.currentMatch = match;
			}
			this.userRepo.save(user1);
			this.userRepo.save(user2);
			matchMakingSet.clear();
		}
		return true;
	}

	/**
	 * @brief Permet de creer une entite achievements lie a chaque user connecte
	 *
	 * @param newUser le nouvel utilisateur qui se connecte
	 */
	 async newConnection(newUser: UserEntity) {
		let userAchievements: AchievementsEntity = await this.AchievementsRepository.save({
			userId: newUser.userId,
		})
	}

	async getUserAchievements(userId: string)
	{
		const userAchievements: AchievementsEntity = await this.AchievementsRepository.findOne({ where: { userId: userId } });
		return userAchievements;
	}

	async setAchievements(user: UserEntity)
	{
		const userAchievements: AchievementsEntity = await this.AchievementsRepository.findOne({ where: { userId: user.userId } });
		if (user.victories === 1 && user.defeats === null || user.defeats === 1 && user.victories === null)
			userAchievements.FirstMatch = true;
		else if (user.victories === 3)
			userAchievements.Victoryx3 = true;
		else if (user.victories === 5)
			userAchievements.Victoryx5 = true;
		else if (user.victories === 10)
			userAchievements.Victoryx10 = true;
		else if (user.defeats === 3)
			userAchievements.Defeatx3 = true;
		await userAchievements.save();
	}

	//ends the game
	async endGame(client: Socket, match: Match, winner: UserEntity , loser: UserEntity) {
		if (match == null) { // opponent refused the invitation
			winner.currentMatch = null;
			loser.currentMatch = null;
			this.userRepo.save(winner);
			this.userRepo.save(loser);
			client.leave(winner.currentMatch.roomName);
			throw new ForbiddenException(
				"Your opponent gave up the game.",
			);
		}
		match.isEnd = true;
		if (match.isLocal == false) {
			winner.victories++;
			loser.defeats++;
			this.setAchievements(winner);
			this.setAchievements(loser);
		}
		else {
			// trigger the pop-up(?modal) with victory info and home button
			winner.currentMatch = null;
			loser.currentMatch = null;
			this.userRepo.save(winner);
			this.userRepo.save(loser);
			console.log('We have a winner !');
			return (false);
		}
		winner.currentMatch = null;
		loser.currentMatch = null;
		this.userRepo.save(winner);
		this.userRepo.save(loser);
		return true;
	}

	//check if the game should end and exec the proper funciton if so
	async checkEndGame(client: Socket, match: Match) {
		const user1: UserEntity = await this.userService.getUserById(match.player1);
		const user2: UserEntity = await this.userService.getUserById(match.player2);
		if (match.p1Score >= 2){
			this.endGame(client, match, user1, user2);
			return (1);
		}
		if (match.p2Score >= 2) {
			this.endGame(client, match, user2, user1);
			return (2);
		}
		return (0);
	}

	async	getInvitations(client: Socket) {
		const allInvitations: InvitationEntity[] = await this.invitationRepository.find({
			where: [
				{ receiver: { userId: client.data.user.userId } },
			],
		});
		const currentTime = Date.now();
		for (const invitation of allInvitations) {
			if (currentTime - invitation.creationDate >= 60000){
				this.refuseInvite(client, invitation.creator.userId);
			}
		}
		console.log('invit after suppr : ', allInvitations);
		const invitAfterCheck: InvitationEntity[] = await this.invitationRepository.find({
			where: [
				{ receiver: { userId: client.data.user.userId } },
			],
		});
		return invitAfterCheck;
	}

	/**
	 * create a room, initialize it and join it.
	 * @param client the user that sends an invitation
	 */
		async	sendInvite(client: Socket, userToInviteId: string) {
				const sentInvitations: InvitationEntity[] = await this.invitationRepository.find({
					where: [
						{ creator: { userId: client.data.user.userId } },
					],
				});
				if (sentInvitations.length > 0) {
					throw new ForbiddenException(
					"You can't send more than one invitation.",
					);
				}
				const date = Date.now();
				const userToInvite: UserEntity = await this.userService.getUserById(userToInviteId);
				if (userToInvite.currentMatch != null) {
					throw new ForbiddenException(
					"This user is already in game.",
					);
				}
				await this.invitationRepository.save( {
					creator: client.data.user,
					receiver: userToInvite,
					status: 'pending',
					creationDate: date,
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
			.select(['invitation.requestId', 'creator', 'invitation.creationDate'])
			.leftJoinAndSelect('invitation.creator', 'creator')
			.leftJoinAndSelect('invitation.receiver', 'receiver')
			.where('invitation.creator = :id', { id: userInvitingId})
			.getOne();
			const invitId: string = invitation.requestId;
			invitation = await this.invitationRepository.save({
				requestId: invitId,
				creator: userInviting,
				receiver: client.data.user,
				status: 'accepted'
			})
			const allInvitations: InvitationEntity[] = await this.invitationRepository.find({
				where: [
					{ receiver: { userId: client.data.user.userId } },
				],
			});
			for (const inviteIter of allInvitations) {
				if (inviteIter != invitation){
					this.refuseInvite(client, inviteIter.creator.userId);
				}
			}
			// get all invitations received, refuse all that
			// aren't invitation
			const currentRoomName: string = inviteRoomMap.get(userInvitingId);
			inviteRoomMap.delete(userInvitingId);
			const currentMatch: Match = this.setDefaultPos(currentRoomName);
			currentMatch.player1 = client.data.user.userId;
			currentMatch.p1User = currentMatch.player1;
			currentMatch.player2 = userInviting.userId;
			currentMatch.p2User = currentMatch.player2;
			currentMatch.isLocal = false;
			client.join(currentMatch.roomName);
			client.data.user.currentMatch = currentMatch;
			userInviting.currentMatch = currentMatch;
			this.userRepo.save(client.data.user);
			this.userRepo.save(userInviting);
			return (currentRoomName);
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
			const currentRoomName: string = inviteRoomMap.get(userInvitingId);
			return(currentRoomName);
		}
		// async	refuseSentInvite(client: Socket, userInviting: UserEntity) {
		// 	let invitation: InvitationEntity = await this.invitationRepository.createQueryBuilder('invitation')
		// 	.select(['invitation.requestId', 'creator'])
		// 	.leftJoin('invitation.creator', 'creator')
		// 	.leftJoin('invitation.receiver', 'receiver')
		// 	.where('invitation.creator = :id', { id: userInviting.userId})
		// 	.getOne();
		// 	const invitId: string = invitation.requestId;
		// 	invitation = await this.invitationRepository.save({
		// 		requestId: invitId,
		// 		creator: userInviting,
		// 		receiver: client.data.user,
		// 		status: 'declined'
		// 	})
		// 	await this.invitationRepository
		// 	.createQueryBuilder()
		// 	.delete()
		// 	.from(InvitationEntity)
		// 	.where('creator = :id', { id: userInvitingId})
		// 	.execute();
		// 	const currentRoomName: string = inviteRoomMap.get(userInvitingId);
		// 	return(currentRoomName);
		// }

		/**
		 * tells the emitter that the invitation
		 * has been declined
		 */
		async inviteIsDeclined(client: Socket, userInvitedId: string) {
			client.leave(inviteRoomMap.get(client.data.user.userId));
			inviteRoomMap.delete(client.data.user.userId)
			this.endGame(client, client.data.currentMatch, client.data.user, client.data.user)
		}

		/**
		 * try to spectate the chosen user
		 */
		 async spectate(client: Socket, userIdToSpec: string){
			// find user
			const userToSpec: UserEntity = await this.userService.getUserById(userIdToSpec);
			// check if userToSpec.currentMatch != null
			if (userToSpec.currentMatch != null && userToSpec.currentMatch.isEnd == false){
				client.join(userToSpec.currentMatch.roomName);
			}
			else {
				throw new ForbiddenException(
					"You can't spectate this match.",
					);
			}
		}

		/**
		 * try to know if the user is in a game
		 */
		async getCurrentMatch(client: Socket, userIdToSpec: string){
			// find user
			const userToSpec: UserEntity = await this.userService.getUserById(userIdToSpec);
			// check if userToSpec.currentMatch != null
			if (userToSpec.currentMatch != null && userToSpec.currentMatch.isEnd == false){
				return true;
			}
			else {
				return false;
			}
		}

		/**
		 * HANDLE DISCONNECTION
		 *(from game, matchmaking, after sending an invitation)
		 */

		 async handleGameDisconnect(client: Socket){
			// in game
			if (client.data.user.currentMatch != null && client.data.user.currentMatch.isEnd == false) {
				// endGame -> emit victoryOf etc
			}
			// in matchmaking
			if (matchMakingSet.size != 0) {
				for (const item of matchMakingSet)
				{
					if (item == client) {
						matchMakingSet.clear();
						break ;
					}
				}
			}
			// delete sent invitation
			const sentInvitation: InvitationEntity[] = await this.invitationRepository.find({
				where: [
					{ creator: { userId: client.data.user.userId } },
				],
			});
			for (const inviteIter of sentInvitation) {
					this.refuseInvite(client, inviteIter.creator.userId);
			}
			// refuse received invitations
			const allReceivedInvitations: InvitationEntity[] = await this.invitationRepository.find({
				where: [
					{ receiver: { userId: client.data.user.userId } },
				],
			});
			for (const inviteIter of allReceivedInvitations) {
					this.refuseInvite(client, inviteIter.creator.userId);
			}
		 }
}
