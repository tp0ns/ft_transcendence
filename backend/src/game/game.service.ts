/* eslint-disable prettier/prettier */
import {
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { fstat } from 'fs';
import { Socket } from 'socket.io';
import { UserEntity } from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { Match, Pad, Ball } from './interfaces/game.interface';
import InvitationEntity from './invitations/invitations.entity';
import { AchievementsEntity } from './achievements/achievements.entity';
import { MatchHistoryEntity } from './matchHistory/matchHistory.entity';
import { invitationInterface } from './invitations/invitation.interface';
import { WsException } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';

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
		@InjectRepository(MatchHistoryEntity)
		private MatchHistoryRepository: Repository<MatchHistoryEntity>,
		@InjectRepository(UserEntity)
		private userRepository: Repository<UserEntity>,
		@Inject(forwardRef(() => UserService)) private userService: UserService,
	) {}

	protected inviteMap = new Map<string, invitationInterface>();
	protected matchMakingMap = new Map<string, invitationInterface>();

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
			x: 310,
			y: 240,
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
		if (match.isLocal == true) {
			switch (direction) {
				case 'up':
					if (match.rightPad.y - match.rightPad.speed <= 100) {
						match.rightPad.y = 100;
					} else match.rightPad.y -= match.rightPad.speed;
					break;
				case 'down':
					if (match.rightPad.y + match.rightPad.speed >= 480) {
						match.rightPad.y = 480;
					} else match.rightPad.y += match.rightPad.speed;
					break;
			}
		}
	}

	// set new position according to mouse (for left pad only)
	async moveMouseLeft(mousePosy: number, match: Match) {
		if (mousePosy <= 100) {
			match.leftPad.y = 100;
		} else if (mousePosy >= 480) {
			match.leftPad.y = 480;
		} else match.leftPad.y = mousePosy;
	}

	// set new position according to mouse (for right pad only)
	async moveMouseRight(mousePosy: number, match: Match) {
		if (match.isLocal == false) {
			if (mousePosy <= 100) {
				match.rightPad.y = 100;
			} else if (mousePosy >= 480) {
				match.rightPad.y = 480;
			} else match.rightPad.y = mousePosy;
		}
	}

	// gameFunction : Switch with all functions related to the match
	async gameFunction(func: string, score: number, match: Match) {
		switch (func) {
			case 'resetBall':
				match.ball.y = 250;
				match.ball.x = 250;
				match.ball.speedy = 0;
				match.ball.goRight = true;
				match.ball.isMoving = false;
		}
		switch (score) {
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
		const roomName = 'room' + Math.random();
		client.join(roomName);
		client.data.currentMatch = this.setDefaultPos(roomName);
		client.data.currentMatch.isLocal = true;
		client.data.currentMatch.p1User = client.data.user.userId;
		client.data.currentMatch.p2User = client.data.currentMatch.p1User;
		client.data.currentMatch.player1 = client.data.currentMatch.p1User;
		client.data.currentMatch.player2 = client.data.currentMatch.p1User;
	}

	/**
	 * ------------------ STATISTICS FOR USER PAGE  ------------------ *
	 *
	 * -  newConnection(newUser)
	 * - getUserAchievements(userId)
	 * - setMatchHistory(winner, loser, match)
	 * - setAchievements(user)
	 * - async endGame(client, match, winner, loser)
	 */

	/**
	 * @brief Permet de creer une entite achievements lie a chaque user connecte
	 * - si l'utilisateur est @tp0ns , @clbouche , @elaachac , @vbaron
	 * -> set du builderAchievement a true
	 * @param newUser le nouvel utilisateur qui se connecte
	 */
	async newConnection(newUser: UserEntity) {
		let builderAchievement: boolean;
		if (
			newUser.schoolId === 56170 ||
			newUser.schoolId === 63187 ||
			newUser.schoolId === 60438 ||
			newUser.schoolId == 69772
		)
			builderAchievement = true;
		await this.AchievementsRepository.save({
			userId: newUser.userId,
			Builder: builderAchievement,
		});
	}

	/**
	 *
	 * @brief Recuperer les achievements d'un utilisateur
	 *
	 */
	async getUserAchievements(userId: string) {
		const userAchievements: AchievementsEntity =
			await this.AchievementsRepository.findOne({ where: { userId: userId } });
		return userAchievements;
	}

	async setMatchHistory(winner: UserEntity, loser: UserEntity, match: Match) {
		let newMatchHistory: MatchHistoryEntity =
			await this.MatchHistoryRepository.save({
				winnerUsername: winner.username,
				winnerScore:
					match.p1Score >= match.p2Score ? match.p1Score : match.p2Score,
				loserUsername: loser.username,
				loserScore:
					match.p1Score <= match.p2Score ? match.p1Score : match.p2Score,
			});
		winner.MatchHistory = [...winner.MatchHistory, newMatchHistory];
		loser.MatchHistory = [...loser.MatchHistory, newMatchHistory];
	}

	/**
	 * Permet de set les achivements d'un joueur
	 * - premiere entree dans la fonction: firstMatch
	 * - calcul selon le nombre de victoires ou de defaites
	 * du user pour les autres achievements
	 */
	async setAchievements(user: UserEntity) {
		const userAchievements: AchievementsEntity =
			await this.AchievementsRepository.findOne({
				where: { userId: user.userId },
			});
		userAchievements.FirstMatch = true;
		if (user.victories === 3) userAchievements.Victoryx3 = true;
		else if (user.victories === 5) userAchievements.Victoryx5 = true;
		else if (user.victories === 10) userAchievements.Victoryx10 = true;
		else if (user.defeats === 3) userAchievements.Defeatx3 = true;
		await userAchievements.save();
	}

	//ends the game
	async endGame(
		client: Socket,
		match: Match,
		winner: UserEntity,
		loser: UserEntity,
	) {
		if (match == null) {
			// opponent refused the invitation
			winner.currentMatch = null;
			loser.currentMatch = null;
			await this.userRepo.save(winner);
			await this.userRepo.save(loser);
			client.leave(winner.currentMatch.roomName);
			throw new ForbiddenException('Your opponent gave up the game.');
		}
		match.isEnd = true;
		if (match.isLocal == false) {
			winner.victories++;
			loser.defeats++;
			await this.setAchievements(winner);
			await this.setAchievements(loser);
			await this.setMatchHistory(winner, loser, match);
		} else {
			// trigger the pop-up(?modal) with victory info and home button
			winner.currentMatch = null;
			loser.currentMatch = null;
			await this.userRepo.save(winner);
			await this.userRepo.save(loser);
			console.log('We have a winner !');

			return false;
		}
		winner.currentMatch = null;
		loser.currentMatch = null;
		await this.userRepo.save(winner);
		await this.userRepo.save(loser);
		return true;
	}

	//check if the game should end and exec the proper funciton if so
	async checkEndGame(client: Socket, match: Match) {
		const user1: UserEntity = await this.userService.getUserById(match.player1);
		const user2: UserEntity = await this.userService.getUserById(match.player2);
		if (match.p1Score >= 2) return 1;
		else if (match.p2Score >= 2) return 2;
		return 0;
	}

	/**
	 * ------------------ INVITATIONS  ------------------ *
	 *
	 * - sendInvitation(user, userToInviteId);
	 * - getUserAchievements(userId)
	 * - setMatchHistory(winner, loser, match)
	 * - setAchievements(user)
	 * - async endGame(client, match, winner, loser)
	 */

	/**
	 *
	 * @brief Envoie d'un invitation pour jouer
	 *
	 * @param client celui qui envoie l'invitation
	 * @param userToInviteId l'id du user invite
	 */
	async sendInvite(client: Socket, userToInviteId: string) {
		const user: UserEntity = client.data.user;
		const roomId: string = uuidv4();
		const userToInvite: UserEntity = await this.userService.getUserById(
			userToInviteId,
		);
		if (userToInvite.status === 'disconnected')
			return 'User is disconnected, try again later';
		if (user.currentMatch != null)
			return "You can't invite someone while playing";
		if (userToInvite.currentMatch != null)
			return 'This user is already in game.';
		if (this.inviteMap.has(user.userId))
			return "You can't send more than one invitation.";
		if (this.inviteMap.has(userToInviteId))
			return 'This player is already waiting to play';
		if (this.matchMakingMap.has(user.userId))
			return "You can't send invitations while in matchmaking.";
		if (this.matchMakingMap.has(userToInviteId))
			return "You can't send invitations while in matchmaking.";
		else {
			this.inviteMap.set(user.userId, {
				id: client.id,
				roomId: roomId,
				player1: user,
				player2: userToInvite,
			});
			return null;
		}
	}

	/**
	 *
	 * @brief Recupere les invitations du user
	 *
	 */
	getInvitations(user: UserEntity) {
		let invites: invitationInterface[] = [];
		for (let [key, value] of this.inviteMap.entries())
			if (value.player2.userId === user.userId) invites.push(value);
		return invites;
	}

	/**
	 *
	 * @brief Acceptation de l'invitation
	 *
	 * @param user celui qui accepte l'invitation
	 * @param invitationId l'invitation concernee
	 * @returns l'invitation pour pouvoir supprimer
	 * toutes les autres invitations
	 *
	 * @todo supprimer le user si pas utile
	 */
	acceptInvite(user: UserEntity, invitationId: string) {
		if (!this.inviteMap.has(invitationId))
			throw new WsException('The other player has left');
		return this.inviteMap.get(invitationId);
	}

	/**
	 *
	 * @brief Supprime l'invitation refusee
	 *
	 * @param invitationId l'invitation concernee
	 */
	refuseInvite(invitationId: string) {
		this.inviteMap.delete(invitationId);
	}

	/**
	 * @brief Permet de refuser toutes autres les invitations si
	 * le user en accepte une
	 *
	 * @param userId de celui qui a accepte une invitation
	 * @param InvitationsToAvoidId l'invitation a ne pas supprimer
	 */
	deleteReceivedInvite(userId: string) {
		let invitesToDelete: string[] = [];
		for (let [key, value] of this.inviteMap.entries())
			if (value.player2.userId === userId) invitesToDelete.push(key);
		for (const invite of invitesToDelete) {
			this.inviteMap.delete(invite);
		}
	}

	/**
	 *
	 * @brief Permet de savoir si l'invitation
	 * qu'il attend n'a pas ete refuse
	 *
	 * @param userId l'id de celui qui attends
	 * @returns true ou false
	 */
	needWaiting(userId: string) {
		return this.inviteMap.has(userId) || this.matchMakingMap.has(userId);
	}

	deleteAllUserInvite(userId: string) {
		this.deleteReceivedInvite(userId);
		this.inviteMap.delete(userId);
		this.matchMakingMap.delete(userId);
	}

	/**
	 *
	 * MATCHMAKING
	 */

	matchmaking(client: Socket) {
		const user: UserEntity = client.data.user;
		const roomId: string = uuidv4();
		if (user.currentMatch != null)
			throw new ForbiddenException("You can't start matchmaking while playing");
		if (this.inviteMap.has(user.userId))
			throw new ForbiddenException(
				"You can't start matchmaking while waiting for an invite",
			);
		if (this.matchMakingMap.has(user.userId))
			throw new ForbiddenException('You already are in a matchmaking');
		if (this.matchMakingMap.size > 0) {
			let matchmake = this.matchMakingMap.entries().next();
			matchmake.value[1].player2 = user;
			return matchmake.value[1];
		}
		this.matchMakingMap.set(user.userId, {
			id: client.id,
			roomId: roomId,
			player1: user,
			player2: null,
		});
		return null;
	}

	/**
	 * ------------------ SPECTATE  ------------------ *
	 *
	 * -
	 * -
	 * -
	 * -
	 * -
	 */

	/**
	 * try to spectate the chosen user
	 */
	async spectate(client: Socket, userIdToSpec: string) {
		// find user
		const userToSpec: UserEntity = await this.userService.getUserById(
			userIdToSpec,
		);
		// check if userToSpec.currentMatch != null
		if (client.data.user.currentMatch != null) {
			throw new ForbiddenException('You are already in a match.');
		}
		if (
			userToSpec.currentMatch != null &&
			userToSpec.currentMatch.isEnd == false
		) {
			client.data.user.currentMatch = userToSpec.currentMatch;
			client.join(userToSpec.currentMatch.roomName);
			await this.userRepo.save(client.data.user);
		} else {
			throw new ForbiddenException("You can't spectate this match.");
		}
	}

	/**
	 * try to know if the user is in a game
	 */
	async getCurrentMatch(client: Socket, userIdToSpec: string) {
		// find user
		const userToSpec: UserEntity = await this.userService.getUserById(
			userIdToSpec,
		);
		// check if userToSpec.currentMatch != null
		if (
			userToSpec.currentMatch != null &&
			userToSpec.currentMatch.isEnd == false
		) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * HANDLE DISCONNECTION
	 *(from game, matchmaking, after sending an invitation)
	 */

	// async handleGameDisconnect(client: Socket): Promise<string> {
	// 	// in game
	// 	let winnerId: string = null;
	// 	if (
	// 		client.data.user.currentMatch != null &&
	// 		client.data.user.currentMatch.isEnd == false
	// 	) {
	// 		if (client.data.user.currentMatch.p1User == client.data.user.userId) {
	// 			winnerId = client.data.user.currentMatch.player2;
	// 			client.data.user.currentMatch.p2Score = 5;
	// 			client.data.user.currentMatch.p1Score = 0;
	// 		} else {
	// 			winnerId = client.data.user.currentMatch.player1;
	// 			client.data.user.currentMatch.p1Score = 5;
	// 			client.data.user.currentMatch.p2Score = 0;
	// 		}
	// 		await this.userRepo.save(client.data.user);
	// 	}
	// 	// in matchmaking
	// 	// if (matchMakingSet.size != 0) {
	// 	// 	for (const item of matchMakingSet) {
	// 	// 		if (item == client) {
	// 	// 			matchMakingSet.clear();
	// 	// 			break;
	// 	// 		}
	// 	// 	}
	// 	}
	// delete sent invitation
	// const sentInvitation: InvitationEntity[] =
	// 	await this.invitationRepository.find({
	// 		where: [{ creator: { userId: client.data.user.userId } }],
	// 	});
	// for (const inviteIter of sentInvitation) {
	// 	this.refuseInvite(client, inviteIter.creator.userId);
	// }
	// // refuse received invitations
	// const allReceivedInvitations: InvitationEntity[] =
	// 	await this.invitationRepository.find({
	// 		where: [{ receiver: { userId: client.data.user.userId } }],
	// 	});
	// for (const inviteIter of allReceivedInvitations) {
	// 	this.refuseInvite(client, inviteIter.creator.userId);
	// }
	// 	return winnerId;
	// }

	// 	async isInGame(client: Socket) {
	// 		const sentInvitations: InvitationEntity[] =
	// 			await this.invitationRepository.find({
	// 				where: [{ creator: { userId: client.data.user.userId } }],
	// 			});
	// 		if (client.data.user.currentMatch != null || sentInvitations != null)
	// 			return true;
	// 		else return false;
	// 	}
}
