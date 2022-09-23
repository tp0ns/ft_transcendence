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
import { Ball, Coordinate, Game, Grid, Pad } from './interfaces/game.interface';
import InvitationEntity from './invitations/invitations.entity';
import { AchievementsEntity } from './achievements/achievements.entity';
import { MatchHistoryEntity } from './matchHistory/matchHistory.entity';
import { invitationInterface } from './invitations/invitation.interface';
import { WsException } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';
import { initGrid } from './utils/initGrid';
import { Match } from 'src/game/interfaces/match.interface';


let match: Match;

// let games = new Map<string, Game>();
let PAD_SPEED = 10;

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
	) { }

	protected inviteMap = new Map<string, invitationInterface>();
	protected matchMakingMap = new Map<string, invitationInterface>();
	protected games = new Map<string, Game>();

	setMatch(user: UserEntity, roomId: string) {
		user.currentMatch = roomId;
		this.userRepo.save(user);

	}

	getMyGame(userId: string) {
		console.log("yaala");
		// console.log("games", (this.games));
		// console.log("map size", this.games.size)
		console.log(JSON.stringify(this.games.values()));
		for (const value of this.games.values()) {
			console.log("inFor");
			if (value.player1.user.userId === userId || value.player2.user.userId === userId) {
				return value;
			};
		}
		console.log("outFor");
	}

	initGame = (invitation: invitationInterface) => {
		let grid: Grid = initGrid();
		let game: Game = {
			id: invitation.roomId,
			grid: grid,
			player1: {
				user: invitation.player1,
				score: 0,
			},
			player2: {
				user: invitation.player2,
				score: 0,
			},
			ongoing: false,
		}
		this.games.set(invitation.roomId, game);
		console.log("this.games: ", this.games)
		return game;
	}

	movePad(user: UserEntity, direction: string, gameId: string) {
		let game: Game = this.games[gameId];
		let padToMove: Pad = game.grid.pad1;

		console.log("game.player2.user: ", game.player2.user)
		console.log("user: ", user)
		if (game.player2.user.userId === user.userId)
			padToMove = game.grid.pad2;
		if (direction === "up" && padToMove.pos.y > 0)
			padToMove.pos.y -= PAD_SPEED;
		else if (direction === "down" && padToMove.pos.y + padToMove.size.y < game.grid.size.y)
			padToMove.pos.y += PAD_SPEED;
		return game;
	}


	moveBall(gameId: string) {

	}

	gameLoop(server: any, gameId: string, state: string) {
		let timer;
		console.log("caca");
		this.games[gameId].ongoing = true;
		if (state === "start") {
			timer = setInterval(() => {
				this.moveBall(gameId)
				server.to(gameId).emit('updatedGame', this.games[gameId]);
			}

				, 5000)
		}
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

	// //check if the game should end and exec the proper funciton if so
	// async checkEndGame(client: Socket, match: Match) {
	// 	const user1: UserEntity = await this.userService.getUserById(match.player1);
	// 	const user2: UserEntity = await this.userService.getUserById(match.player2);
	// 	if (match.p1Score >= 2) return 1;
	// 	else if (match.p2Score >= 2) return 2;
	// 	return 0;
	// }

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
}
