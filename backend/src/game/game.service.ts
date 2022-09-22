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
import { initGrid } from './utils/initGrid';
import { Match } from 'src/game/interfaces/match.interface';


const matchMakingSet = new Set<Socket>();
const inviteSet = new Set<Socket>();
const inviteRoomMap = new Map<string, string>(); // <userInviting, roomId>
let match: Match;

let games: Game[] = [];

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


	initDummyGame = (roomId: string, user: UserEntity) => {
		let res: Game = null;
		if (games && games[0] && games[0].player1 && games[0].player2)
			return games[0];
		if (games) {
			games.map((game) => {
				if (game.id === roomId && !game.player2) {
					game.player2 = {
						user: user,
						score: 0
					}
					res = game;
				}
			})
		}
		if (!res) {
			let grid: Grid = initGrid();
			let game: Game = {
				id: roomId,
				grid: grid,
				player1: null,
				player2: null
			}
			game.player1 = {
				user: user,
				score: 0
			}
			games.push(game);
			res = game;
		}
		return res;
	}



	initGame = (roomId: string) => {
		let grid: Grid = initGrid();
		let game: Game = {
			id: roomId,
			grid: grid,
			player1: null,
			player2: null
		}
		return game;
	}

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
		const user1: UserEntity = await this.userService.getUserById(match.player1.userId);
		const user2: UserEntity = await this.userService.getUserById(match.player2.userId);
		if (match.p1Score >= 2) return 1;
		else if (match.p2Score >= 2) return 2;
		return 0;
	}

	async getInvitations(client: Socket) {
		const allInvitations: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ receiver: { userId: client.data.user.userId } }],
			});
		const currentTime = Date.now();
		for (const invitation of allInvitations) {
			if (currentTime - invitation.creationDate >= 60000) {
				this.refuseInvite(client, invitation.creator.userId);
			}
		}
		// console.log('invit after suppr : ', allInvitations);
		const invitAfterCheck: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ receiver: { userId: client.data.user.userId } }],
			});
		return invitAfterCheck;
	}

	/**
	 * create a room, initialize it and join it.
	 * @param client the user that sends an invitation
	 */
	async sendInvite(client: Socket, userToInviteId: string) {
		const sentInvitations: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ creator: { userId: client.data.user.userId } }],
			});
		if (sentInvitations.length > 0) {
			throw new ForbiddenException("You can't send more than one invitation.");
		}
		const date = Date.now();
		const userToInvite: UserEntity = await this.userService.getUserById(
			userToInviteId,
		);
		if (userToInvite.currentMatch != null) {
			throw new ForbiddenException('This user is already in game.');
		}
		await this.invitationRepository.save({
			creator: client.data.user,
			receiver: userToInvite,
			status: 'pending',
			creationDate: date,
		});
		const roomName = 'inviteRoom' + Math.random();
		client.join(roomName);
		inviteRoomMap.set(client.data.user.userId, roomName);
	}

	/**
	 * the user accepted the invitation
	 * the user is now joining the game
	 * @param client the user accepting the invitation
	 */
	async joinInvite(client: Socket, userInvitingId: string) {
		const userInviting: UserEntity = await this.userService.getUserById(
			userInvitingId,
		);
		let invitation: InvitationEntity = await this.invitationRepository
			.createQueryBuilder('invitation')
			.select(['invitation.requestId', 'creator', 'invitation.creationDate'])
			.leftJoinAndSelect('invitation.creator', 'creator')
			.leftJoinAndSelect('invitation.receiver', 'receiver')
			.where('invitation.creator = :id', { id: userInvitingId })
			.getOne();
		const invitId: string = invitation.requestId;
		invitation = await this.invitationRepository.save({
			requestId: invitId,
			creator: userInviting,
			receiver: client.data.user,
			status: 'accepted',
		});
		const allInvitations: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ receiver: { userId: client.data.user.userId } }],
			});
		for (const inviteIter of allInvitations) {
			if (inviteIter != invitation) {
				this.refuseInvite(client, inviteIter.creator.userId);
			}
		}
		// get all invitations received, refuse all that
		// aren't invitation
		const currentRoomName: string = inviteRoomMap.get(userInvitingId);
		inviteRoomMap.delete(userInvitingId);
		// const currentMatch: Match = this.setDefaultPos(currentRoomName);
		// currentMatch.player1 = client.data.user.userId;
		// currentMatch.p1User = currentMatch.player1;
		// currentMatch.player2 = userInviting.userId;
		// currentMatch.p2User = currentMatch.player2;
		// currentMatch.isLocal = false;
		// client.join(currentMatch.roomName);
		// client.data.user.currentMatch = currentMatch;
		// userInviting.currentMatch = currentMatch;
		await this.userRepo.save(client.data.user);
		await this.userRepo.save(userInviting);
		return currentRoomName;
	}

	/**
	 * cancels the invitation
	 */
	async refuseInvite(client: Socket, userInvitingId: string) {
		const userInviting: UserEntity = await this.userService.getUserById(
			userInvitingId,
		);
		let invitation: InvitationEntity = await this.invitationRepository
			.createQueryBuilder('invitation')
			.select(['invitation.requestId', 'creator'])
			.leftJoin('invitation.creator', 'creator')
			.leftJoin('invitation.receiver', 'receiver')
			.where('invitation.creator = :id', { id: userInvitingId })
			.getOne();
		const invitId: string = invitation.requestId;
		invitation = await this.invitationRepository.save({
			requestId: invitId,
			creator: userInviting,
			receiver: client.data.user,
			status: 'declined',
		});
		await this.invitationRepository
			.createQueryBuilder()
			.delete()
			.from(InvitationEntity)
			.where('creator = :id', { id: userInvitingId })
			.execute();
		const currentRoomName: string = inviteRoomMap.get(userInvitingId);
		return currentRoomName;
	}

	async refuseSentInvite(client: Socket, userInviting: UserEntity) {
		let invitation: InvitationEntity = await this.invitationRepository
			.createQueryBuilder('invitation')
			.select(['invitation.requestId', 'creator'])
			.leftJoin('invitation.creator', 'creator')
			.leftJoin('invitation.receiver', 'receiver')
			.where('invitation.creator = :id', { id: userInviting.userId })
			.getOne();
		const invitId: string = invitation.requestId;
		const receiv: UserEntity = invitation.receiver;
		invitation = await this.invitationRepository.save({
			requestId: invitId,
			creator: userInviting,
			receiver: receiv,
			status: 'declined',
		});
		await this.invitationRepository
			.createQueryBuilder()
			.delete()
			.from(InvitationEntity)
			.where('creator = :id', { id: userInviting.userId })
			.execute();
		const currentRoomName: string = inviteRoomMap.get(userInviting.userId);
		return currentRoomName;
	}

	/**
	 * tells the emitter that the invitation
	 * has been declined
	 */
	async inviteIsDeclined(client: Socket, userInvitedId: string) {
		client.leave(inviteRoomMap.get(client.data.user.userId));
		inviteRoomMap.delete(client.data.user.userId);
		this.endGame(
			client,
			client.data.currentMatch,
			client.data.user,
			client.data.user,
		);
	}

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

	async handleGameDisconnect(client: Socket): Promise<string> {
		// in game
		let winnerId: string = null;
		if (
			client.data.user.currentMatch != null &&
			client.data.user.currentMatch.isEnd == false
		) {
			if (client.data.user.currentMatch.p1User == client.data.user.userId) {
				winnerId = client.data.user.currentMatch.player2;
				client.data.user.currentMatch.p2Score = 5;
				client.data.user.currentMatch.p1Score = 0;
			} else {
				winnerId = client.data.user.currentMatch.player1;
				client.data.user.currentMatch.p1Score = 5;
				client.data.user.currentMatch.p2Score = 0;
			}
			await this.userRepo.save(client.data.user);
		}
		// in matchmaking
		if (matchMakingSet.size != 0) {
			for (const item of matchMakingSet) {
				if (item == client) {
					matchMakingSet.clear();
					break;
				}
			}
		}
		// delete sent invitation
		const sentInvitation: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ creator: { userId: client.data.user.userId } }],
			});
		for (const inviteIter of sentInvitation) {
			this.refuseInvite(client, inviteIter.creator.userId);
		}
		// refuse received invitations
		const allReceivedInvitations: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ receiver: { userId: client.data.user.userId } }],
			});
		for (const inviteIter of allReceivedInvitations) {
			this.refuseInvite(client, inviteIter.creator.userId);
		}
		return winnerId;
	}

	async isInGame(client: Socket) {
		const sentInvitations: InvitationEntity[] =
			await this.invitationRepository.find({
				where: [{ creator: { userId: client.data.user.userId } }],
			});
		if (client.data.user.currentMatch != null || sentInvitations != null)
			return true;
		else return false;
	}
}
