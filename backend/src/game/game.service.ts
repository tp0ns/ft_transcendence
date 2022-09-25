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
import { GridFSBucket, Repository } from 'typeorm';
import { Ball, Coordinate, Game, Game_State, Grid, Pad, Player } from './interfaces/game.interface';
import InvitationEntity from './invitations/invitations.entity';
import { AchievementsEntity } from './achievements/achievements.entity';
import { MatchHistoryEntity } from './matchHistory/matchHistory.entity';
import { invitationInterface } from './invitations/invitation.interface';
import { WsException } from '@nestjs/websockets';
import { v4 as uuidv4 } from 'uuid';
import { GRID, initGrid } from './utils/initGrid';
import { Match } from 'src/game/interfaces/match.interface';


let match: Match;

// let games = new Map<string, Game>();
let PAD_SPEED = 20;
export let BALL_SPEED = 5;
let INTERVAL_SPEED = 15;
let MAX_SCORE = 2;
let MAX_BOUNCE_ANGLE = 5 * Math.PI / 12
let BALL_ACCELERATION = 1.15

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
		for (const value of this.games.values()) {
			if (value.player1.user.userId === userId || value.player2.user.userId === userId) {
				return value;
			};
		}
	}

	initOnline(invitation: invitationInterface) {
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
			state: "readyPlay",
			type: 'online',
		}
		this.games.set(invitation.roomId, game);
		return game;
	}

	initLocal(user: UserEntity) {
		let grid: Grid = initGrid();
		let game: Game = {
			id: uuidv4(),
			grid: grid,
			player1: {
				user: user,
				score: 0,
			},
			player2: {
				user: user,
				score: 0,
			},
			state: "readyPlay",
			type: "local"
		}
		this.games.set(game.id, game);
		return game;
	}

	movePad(user: UserEntity, direction: string, gameId: string, type: string) {
		let game: Game = this.games.get(gameId);
		let padToMove: Pad = game.grid.pad2;

		if (game.player2.user.userId === user.userId)
			padToMove = game.grid.pad1;
		if (type === "local")
			padToMove = game.grid.pad2;
		if (direction === "up" && padToMove.pos.y > 0)
			padToMove.pos.y -= PAD_SPEED;
		else if (direction === "down" && padToMove.pos.y + padToMove.size.y < game.grid.size.y)
			padToMove.pos.y += PAD_SPEED;
		return game;
	}


	moveBall(ball: Ball) {
		ball.pos.x += ball.direction.x;
		ball.pos.y += ball.direction.y;
	}

	defineWall(posX: number, posY: number, width: number, height: number) {
		let wall: Pad = {
			pos: {
				x: posX,
				y: posY,
			},
			size: {
				x: width,
				y: height
			}
		}
		return wall;
	}

	resetGrid(grid: Grid) {
		grid.ball.direction.x = -BALL_SPEED;
		if (grid.ball.pos.x <= 0)
			grid.ball.direction.x = BALL_SPEED;
		grid.ball.direction.y = BALL_SPEED / 4;
		grid.ball.pos.x = grid.size.x / 2;
		grid.ball.pos.y = grid.size.y / 2;
		grid.pad1.pos.x = 0;
		grid.pad1.pos.y = grid.size.y / 2 - grid.pad1.size.y / 2;
		grid.pad2.pos.x = grid.size.x - grid.pad2.size.x;
		grid.pad2.pos.y = grid.size.y / 2 - grid.pad2.size.y / 2;
	}

	checkWinner(game: Game): Game_State {
		if ((game.player1.score >= MAX_SCORE || game.player2.score >= MAX_SCORE))
			game.state = "end";
		return game.state;
	}

	isLeftWallCollision(ball: Ball, wall: Pad, game: Game) {
		if (ball.pos.x - ball.radius <= wall.pos.x) {
			game.player2.score += 1;
			return true;
		}
		return false;
	}

	isRightWallCollision(ball: Ball, wall: Pad, game: Game) {
		if (ball.pos.x + ball.radius >= wall.pos.x) {
			game.player1.score += 1;
			return true;
		}
		return false;
	}

	isTopWallCollision(ball: Ball, wall: Pad) {
		if (ball.pos.y - ball.radius <= wall.pos.y)
			ball.direction.y = -ball.direction.y;
	}

	isBottomWallCollision(ball: Ball, wall: Pad) {
		if (ball.pos.y + ball.radius >= wall.pos.y)
			ball.direction.y = -ball.direction.y;
	}

	isLeftPadCollision(ball: Ball, pad: Pad) {
		if (ball.pos.x - ball.radius <= pad.pos.x + pad.size.x && (ball.pos.y >= pad.pos.y && ball.pos.y <= pad.pos.y + pad.size.y)) {
			// let intersect = ball.pos.y - ball.radius;
			// this.bouncePad(ball, pad, intersect);
			ball.direction.x = -ball.direction.x * BALL_ACCELERATION;
			return true;
		}
		return false;

	}

	isRightPadCollision(ball: Ball, pad: Pad) {
		if (ball.pos.x + ball.radius >= pad.pos.x && (ball.pos.y >= pad.pos.y && ball.pos.y <= pad.pos.y + pad.size.y)) {
			// let intersect = ball.pos.y + ball.radius;
			// this.bouncePad(ball, pad, intersect);
			ball.direction.x = -ball.direction.x * BALL_ACCELERATION;
			return true;
		}
		return false;

	}

	bouncePad(ball: Ball, pad: Pad, intersect: number) {
		// var impact = ball.pos.y - pad.pos.y + pad.size.y / 2;
		// var ratio = pad.size.y / (pad.size.y / 2);
		// var angle = Math.round((impact * ratio) / 10);
		// if (angle >= 10) {
		// 	angle -= 10;
		// 	angle = -angle;
		// }
		// ball.direction.y = angle;
		// ball.direction.y = -ball.direction.y;
		// ball.direction.x = -ball.direction.x;
		var relativeIntersectY = (pad.pos.y + (pad.size.y / 2)) - (intersect);
		var normalizedIntersectionY = (relativeIntersectY / (pad.size.y / 2));
		var bounceAngle = normalizedIntersectionY * MAX_BOUNCE_ANGLE;
		ball.direction.x = BALL_SPEED * Math.cos(bounceAngle);
		ball.direction.y = BALL_SPEED * (-Math.sin(bounceAngle));
	}

	checkCollision(game: Game): Game_State {
		let padCollision = false;
		let leftWall: Pad = this.defineWall(0, 0, 0, game.grid.size.y);
		let rightWall = this.defineWall(game.grid.size.x, 0, 0, game.grid.size.y);
		let topWall = this.defineWall(0, 0, game.grid.size.x, 0);
		let bottomWall = this.defineWall(0, game.grid.size.y, game.grid.size.x, 0);
		padCollision = this.isRightPadCollision(game.grid.ball, game.grid.pad2)
		padCollision = this.isLeftPadCollision(game.grid.ball, game.grid.pad1)
		this.isTopWallCollision(game.grid.ball, topWall)
		this.isBottomWallCollision(game.grid.ball, bottomWall)
		if (!padCollision) {
			if (this.isLeftWallCollision(game.grid.ball, leftWall, game) || this.isRightWallCollision(game.grid.ball, rightWall, game)) {
				this.resetGrid(game.grid);
				game.state = "readyPlay";
			}
		}
		return game.state;
	}

	gameLoop(client: Socket, server: any, gameId: string) {
		let game = this.games.get(gameId);
		game.state = 'ongoing';
		if (game.state === 'ongoing') {
			let timer = setInterval(() => {
				game.state = this.checkCollision(game);
				game.state = this.checkWinner(game);
				this.moveBall(game.grid.ball);
				server.to(gameId).emit('updatedGame', game);
				if (game.state === "end" || game.state === "readyPlay") {
					if (game.state === "end") {
						this.endGame(game);
						this.games.delete(game.id);
						client.leave(gameId);
					}
					// if (game.state === "quit") {
					// 	this.games.delete(game.id);
					// 	client.leave(gameId);
					// }
					clearInterval(timer);
				}
			}, INTERVAL_SPEED)
		}
		console.log("game.state after loop: ", game.state);
		return game;
	}

	async setGameInfos(winner: UserEntity, loser: UserEntity) {
		winner.victories++;
		loser.defeats++;
		winner.currentMatch = null;
		loser.currentMatch = null;
		await this.setAchievements(winner);
		await this.setAchievements(loser);
		this.userRepo.save(winner);
		this.userRepo.save(loser);
	}

	/**
	 * 
	 * @param game 
	 * 
	 * @todo CHANGER LE SCORE A 5
	 */
	async endGame(game: Game) {
		if (game.type != 'local') {
			let winner: UserEntity;
			let loser: UserEntity;
			if (game.player1.score === 2) {
				winner = game.player1.user;
				loser = game.player2.user;
				await this.setMatchHistory(game.player1, game.player2);
			}
			else {
				winner = game.player2.user;
				loser = game.player1.user;
				await this.setMatchHistory(game.player2, game.player1);
			}
			this.setGameInfos(winner, loser)
		}
	}

	changedTab(user: UserEntity) {
		this.inviteMap.delete(user.userId);
		this.matchMakingMap.delete(user.userId)
	}

	async quitGame(user: UserEntity) {
		let game: Game = this.getMyGame(user.userId);
		this.games[game.id].state = "quit";
		if (game) {
			let winner: UserEntity;
			let loser: UserEntity = user;
			if (game.player2.user.userId === user.userId) {
				winner = game.player1.user;
				game.player1.score = 5;
				game.player2.score = 0;
				await this.setMatchHistory(game.player1, game.player2);
			}
			else {
				winner = game.player2.user;
				game.player2.score = 5;
				game.player1.score = 0;
				await this.setMatchHistory(game.player2, game.player1);
			}
			this.setGameInfos(winner, loser);
		}
	}

	cleanGame(user: UserEntity) {

		this.deleteAllUserInvite(user.userId);
		user.currentMatch = null;
		this.userRepo.save(user);
	}

	/**
 * ------------------ SPECTATE  ------------------ *
 *
 * -  spectate(user)
 */

	spectate(user: UserEntity) {
		if (user.currentMatch != null)
			throw new ForbiddenException("You can't spectate while you are playing");

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

	async setMatchHistory(winner: Player, loser: Player) {
		let newMatchHistory: MatchHistoryEntity =
			await this.MatchHistoryRepository.save({
				winnerUsername: winner.user.username,
				winnerScore: winner.score,
				loserUsername: loser.user.username,
				loserScore: loser.score
			});
		winner.user.MatchHistory = [...winner.user.MatchHistory, newMatchHistory];
		loser.user.MatchHistory = [...loser.user.MatchHistory, newMatchHistory];
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
