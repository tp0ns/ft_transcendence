import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WsException,
} from '@nestjs/websockets';
import {
	ForbiddenException,
	Logger,
	UseFilters,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { WsGuard } from 'src/auth/websocket/ws.guard';
import { ChannelService } from '../chat/channel/channel.service';
import { CreateChanDto } from '../chat/channel/dtos/createChan.dto';
import { ChannelEntity } from '../chat/channel/channel.entity';
import { ModifyChanDto } from '../chat/channel/dtos/modifyChan.dto';
import { GameService } from '../game/game.service';
import { RelationsService } from 'src/relations/relations.service';
import RelationEntity from 'src/relations/models/relations.entity';
import UserEntity from 'src/user/models/user.entity';
import { MessageService } from 'src/chat/messages/messages.service';
import { IdDto, UsernameDto } from './dtos/Relations.dto';
import { jwtConstants } from 'src/auth/jwt/jwt.constants';
import { JwtService } from '@nestjs/jwt';
import { JoinChanDto } from 'src/chat/channel/dtos/joinChan.dto';
import { UserService } from 'src/user/user.service';
import { Ball } from '../game/interfaces/game.interface';
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { globalExceptionFilter } from 'src/globalException.filter';
import InvitationEntity from 'src/game/invitations/invitations.entity';
import { AchievementsEntity } from 'src/game/achievements/achievements.entity';
import { MatchHistoryEntity } from 'src/game/matchHistory/matchHistory.entity';

@UseFilters(globalExceptionFilter)
@WebSocketGateway({
	cors: {
		origin: '/',
	},
})
export class GeneralGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private channelService: ChannelService,
		private gameService: GameService,
		private relationsService: RelationsService,
		private messageService: MessageService,
		private userService: UserService,
		private readonly jwtService: JwtService,
	) {}

	@WebSocketServer() server: Server;

	private logger: Logger = new Logger('GeneralGateway');
	// private beginMatch: Match;
	// private beginMatch: Match = this.gameService.setDefaultPos();

	/**
	 * Handles server initialization behaviour
	 */
	@UseGuards(WsGuard)
	afterInit(server: Server) {
		this.logger.log(`Server is properly initialized !`);
	}

	async validateConnection(client: Socket): Promise<UserEntity> {
		try {
			// let client: Socket = context.switchToWs().getClient();
			const sessionCookie: string | string[] = client.handshake.headers.cookie
				.split(';')
				.find(
					(cookie: string) =>
						cookie.startsWith(' Authentication') ||
						cookie.startsWith('Authentication'),
				)
				.split('=')[1];

			const payload = await this.jwtService.verify(sessionCookie, {
				secret: jwtConstants.secret,
			});
			const user = await this.userService.getUserById(payload.sub);
			client.data.user = user;
			if (user) return user;
			return null;
		} catch (err) {
			console.log('Error occured in ws guard : ');
			console.log(err.message);
			// throw new WsException(err.message);
		}
	}

	/**
	 * Handles client connection behaviour
	 */
	@UseGuards(WsGuard)
	async handleConnection(client: Socket) {
		const user: UserEntity = await this.validateConnection(client);

		if (user != null) {
			client.data.user = user;
			this.userService.connectClient(client.data.user);
		}
		this.logger.log(`Client connected: ${client.id}`);
		this.server.emit('updatedChannels');
		this.server.emit('updatedRelations');
	}

	/**
	 * Handles client disconnection behaviour
	 */
	@UseGuards(WsGuard)
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		if (client.data.user) {
			this.gameService.handleGameDisconnect(client);
			this.userService.disconnectClient(client.data.user);
		}
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('playing')
	handlePlaying(client: Socket) {
		if (client.data.user) this.userService.playingClient(client.data.user);
		this.server.emit('updatedRelations');
	}

	/**
	 *   _____ _    _       _______
	 *  / ____| |  | |   /\|__   __|
	 * | |    | |__| |  /  \  | |
	 * | |    |  __  | / /\ \ | |
	 * | |____| |  | |/ ____ \| |
	 *  \_____|_|  |_/_/    \_|_|
	 *
	 */

	/**
	 * ------------------------ SETTINGS CHANNEL  ------------------------- *
	 */

	/**
	 * @brief Creation d'un channel
	 *
	 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le
	 * set en tant que owner
	 * @param channel Pouvoir set les donnees du chan
	 * @emits updatedChannels permet au front de savoir qu'il est temps de
	 * recuperer les channels
	 *
	 */
	@UseGuards(WsGuard)
	@UsePipes(ValidationPipe)
	@SubscribeMessage('createChan')
	async CreateChan(client: Socket, channelEntity: CreateChanDto) {
		const channel: ChannelEntity = await this.channelService.createNewChan(
			client.data.user,
			channelEntity,
		);
		this.server.emit('updatedChannels');
	}

	/**
	 * @brief Creation d'un DM
	 *
	 * @param client l'utilisateur qui souhaite envoye un DM
	 * @param channelEntity les informations necessaires a la
	 *  creation d'un DM (user2, DM = true)
	 */
	@UseGuards(WsGuard)
	@UsePipes(ValidationPipe)
	@SubscribeMessage('createDM')
	async createDM(client: Socket, channelEntity: CreateChanDto) {
		const DM: ChannelEntity = await this.channelService.createNewDM(
			client.data.user,
			channelEntity,
		);
		client.emit('newDM', DM.channelId);
		this.server.emit('updatedChannels');
	}

	/**
	 * @brief Modification d'un channel
	 *
	 * @param client besoin d'envoyer le user qui souhaite modifier le channel pour
	 * verifier qu'il a les droits (owner / admins )
	 * @param modifications interface envoye avec le titre du channel et les
	 * modifications possibles (password / protected / private / admins / members )
	 * @emits updatedChannels permet au front de savoir qu'il est temps de
	 * recuperer les channels
	 *
	 */
	@UseGuards(WsGuard)
	@UsePipes(ValidationPipe)
	@SubscribeMessage('modifyChannel')
	async modifyChannel(client: Socket, modifications: ModifyChanDto) {
		await this.channelService.modifyChannel(client.data.user, modifications);
		this.server.emit('updatedChannels');
	}

	/**
	 * @brief Suppresion d'un channel
	 *
	 * @param client pour checker si le user qui souhaite supprimer le channel a
	 * les droits
	 * @param chanName nom du channel a supprimer
	 * @emits updatedChannels permet au front de savoir qu'il est temps de
	 * recuperer les channels
	 *
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('deleteChan')
	async deleteChan(client: Socket, chanId: string) {
		await this.channelService.deleteChan(client.data.user, chanId);
		this.server.emit('updatedChannels');
	}

	/**
	 * @brief Checker si le password est valide
	 *
	 * @param client
	 * @param informations
	 *
	 * @return false : le user n'a pas rentrer le bon mdp
	 * @return true : le user a rentrer le bon mdp
	 *
	 */
	@UseGuards(WsGuard)
	@UsePipes(ValidationPipe)
	@SubscribeMessage('chanWithPassword')
	async chanWithPassword(client: Socket, informations: JoinChanDto) {
		let bool: boolean = await this.channelService.chanWithPassword(
			client.data.user,
			informations,
		);
		if (bool == true) this.getChannelMessages(client, informations.id);
		else {
			client.emit('chanNeedPw');
			throw new WsException('Wrong Password');
		}
	}

	/**
	 * ------------------------ CIRCULATION IN CHANNELS  ------------------------- *
	 */

	/**
	 * @brief Rejoindre la room
	 *
	 * @param client client qui veut join le chan
	 * @param chanName le nom du channel pour pouvoir le retrouver ou bien le cree
	 *
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('joinRoom')
	async joinRoom(client: Socket, channel: ChannelEntity) {
		let bool: boolean = await this.channelService.joinRoom(
			client.data.user,
			channel,
		);
		if (bool == true) {
			client.join(channel.channelId);
			this.server.emit('joinedRoom');
		}
	}

	/**
	 * @brief Quitter la room
	 *
	 * @param client client qui veut leave le chan
	 * @param channelName le nom du channel pour pouvoir le retrouver ou bien le cree
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('leaveRoom')
	async leaveRoom(client: Socket, channel: ChannelEntity) {
		if (
			channel.members.find(
				(member: UserEntity) => member.userId === client.data.user.userId,
			)
		) {
			client.leave(channel.channelId);
			this.server.emit('leftRoom');
		}
	}

	/**
	 * @brief Quitter le channel
	 *
	 * @param client client qui souhaite quitter le channel
	 * @param chanId l'id du channel
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('quitChan')
	async quitChan(client: Socket, chanId: string) {
		const channel: ChannelEntity = await this.channelService.quitChan(
			client.data.user,
			chanId,
		);
		client.leave(channel.channelId);
		this.server.emit('updatedChannels');
	}

	/**
	 * ------------------------ HANDLE MESSAGES  ------------------------- *
	 */

	/**
	 * MESSAGE POUR LE SERVEUR
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, payload: string[]) {
		this.channelService.sendMessage(client.data.user, payload);
		this.server.emit('msgToClient', payload);
		return payload;
	}

	/**
	 * MESSAGE DANS UN CHANNEL
	 * @param client
	 * @param payload
	 * @param chanName
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToChannel')
	async handleMessageToChan(client: Socket, payload: string[]) {
		const chanId: string = payload[1];
		await this.channelService.sendMessage(client.data.user, payload);
		const socket_list: any[] = await this.server.in(chanId).fetchSockets();
		socket_list.map(async (client) => {
			this.getChannelMessages(client, chanId);
		});
		this.server.to(chanId).emit('updatedMessage');
	}

	/**
	 * DIRECT MESSAGE
	 * @param client
	 * @param payload
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToUser')
	handleMessageToClient(client: Socket, payload: string[]) {
		this.server
			.to(payload[1])
			.emit('directMessage', payload, client.data.user.username);
	}

	/**
	 * ------------------------ GET CHANNELS  ------------------------- *
	 */

	/**
	 * @brief Recuperer tous les channels
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('getAllChannels')
	async getChannels(client: Socket) {
		const channels: ChannelEntity[] =
			await this.channelService.getAllChannels();
		client.emit('sendChans', channels);
	}

	/**
	 * @brief Recuperer que les channels dont le user fait partie
	 * -> autant publiques que privees
	 *
	 * @param client le user en question
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('getMemberChannels')
	async getMemberChannels(client: Socket) {
		const channels: ChannelEntity[] =
			await this.channelService.getMemberChannels(client.data.user);
		client.emit('sendMemberChans', channels);
	}

	/**
	 * @brief Recuperer les messages d'un channel
	 *
	 * @param client le user qui souhaite recuperer les messages
	 * @param chanId pouvoir identifier les messages de quel channel
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('getChannelMessages')
	async getChannelMessages(client: Socket, chanId: string) {
		let channel: ChannelEntity = await this.channelService.getChanById(chanId);
		const messages: MessagesEntity[] =
			await this.messageService.getChannelMessages(client.data.user, chanId);
		if (!messages) return client.emit('userIsBanned');
		if (
			channel &&
			channel.protected == true &&
			!channel.usersInId.includes(client.data.user.userId)
		)
			return client.emit('chanNeedPw');
		client.emit('sendChannelMessages', messages);
	}

	/**
	 *   _____          __  __ ______
	 *  / ____|   /\   |  \/  |  ____|
	 * | |  __   /  \  | \  / | |__
	 * | | |_ | / /\ \ | |\/| |  __|
	 * | |__| |/ ____ \| |  | | |____
	 *  \_____/_/    \_|_|  |_|______|
	 *
	 */

	//Join Match event, draw the game for the user
	@UseGuards(WsGuard)
	@SubscribeMessage('joinMatch')
	async sendDefaultPos(client: Socket) {
		if (client.data.currentMatch)
			this.server
				.to(client.data.currentMatch.roomName)
				.emit(
					'setPosition',
					client.data.currentMatch.leftPad,
					client.data.currentMatch.rightPad,
					client.data.currentMatch.ball,
					client.data.currentMatch.p1Score,
					client.data.currentMatch.p2Score,
				);
	}

	// Move event, allow the user to move its pad
	@UseGuards(WsGuard)
	@SubscribeMessage('move')
	async move(client: Socket, direction: string) {
		await this.gameService.movePad(direction, client.data.currentMatch);
		this.server
			.to(client.data.currentMatch.roomName)
			.emit(
				'setPosition',
				client.data.currentMatch.leftPad,
				client.data.currentMatch.rightPad,
				client.data.currentMatch.ball,
				client.data.currentMatch.p1Score,
				client.data.currentMatch.p2Score,
			);
	}

	// Move event, allow the user to move its pad with mouse
	@UseGuards(WsGuard)
	@SubscribeMessage('mouseMove')
	async mouseMove(client: Socket, mousePosy: number) {
		if (client.data.currentMatch) {
			if (client.data.user.userId == client.data.currentMatch.player1)
				await this.gameService.moveMouseLeft(
					mousePosy,
					client.data.currentMatch,
				);
			else if (client.data.user.userId == client.data.currentMatch.player2)
				await this.gameService.moveMouseRight(
					mousePosy,
					client.data.currentMatch,
				);
			this.server
				.to(client.data.currentMatch.roomName)
				.emit(
					'setPosition',
					client.data.currentMatch.leftPad,
					client.data.currentMatch.rightPad,
					client.data.currentMatch.ball,
					client.data.currentMatch.p1Score,
					client.data.currentMatch.p2Score,
				);
		}
	}

	//	Game Functions, start, reset
	@UseGuards(WsGuard)
	@SubscribeMessage('gameFunctions')
	async gameFunctions(client: Socket, payload) {
		await this.gameService.gameFunction(
			payload[0], //function
			payload[1], //score
			client.data.currentMatch,
		);
		this.server
			.to(client.data.currentMatch.roomName)
			.emit(
				'setPosition',
				client.data.currentMatch.leftPad,
				client.data.currentMatch.rightPad,
				client.data.currentMatch.ball,
				client.data.currentMatch.p1Score,
				client.data.currentMatch.p2Score,
			);
		//end of the game
		const end = await this.gameService.checkEndGame(
			client,
			client.data.currentMatch,
		);
		if (end != 0) {
			const user1: UserEntity = await this.userService.getUserById(
				client.data.currentMatch.player1,
			);
			const user2: UserEntity = await this.userService.getUserById(
				client.data.currentMatch.player2,
			);
			if (end == 1) {
				if (
					(await this.gameService.endGame(
						client,
						client.data.currentMatch,
						user1,
						user2,
					)) == true
				) {
					this.server.emit('endGame');
				}
				this.server
					.to(client.data.currentMatch.roomName)
					.emit('victoryOf', user1);
			} else if (end == 2) {				
				if (
					await this.gameService.endGame(
						client,
						client.data.currentMatch,
						user2,
						user1,
					)
				) {
					// console.log('room:', client.data.currentMatch.roomName);
					this.server.emit('endGame');
				}
				this.server
					.to(client.data.currentMatch.roomName)
					.emit('victoryOf', user2);
			}
		}
	}

	// get the position of the ball and emit it
	@UseGuards(WsGuard)
	@SubscribeMessage('ballMovement')
	async ballMovement(client: Socket, ballPosition: Ball) {
		client.data.currentMatch.ball = ballPosition;
		client.data.currentMatch.p1Touches =
			client.data.currentMatch.ball.p1Touches;
		client.data.currentMatch.p2Touches =
			client.data.currentMatch.ball.p2Touches;
		this.server
			.to(client.data.currentMatch.roomName)
			.emit(
				'setPosition',
				client.data.currentMatch.leftPad,
				client.data.currentMatch.rightPad,
				client.data.currentMatch.ball,
				client.data.currentMatch.p1Score,
				client.data.currentMatch.p2Score,
			);
	}

	//able keyboard commands for local game
	@UseGuards(WsGuard)
	@SubscribeMessage('toggleLocalGame')
	async toggleSinglePlayer(client: Socket) {
		console.log('entered toggleLocalGame');
		await this.gameService.toggleLocalGame(client);
	}

	//disable keyboard commands for local game
	@UseGuards(WsGuard)
	@SubscribeMessage('toggleMatchMaking')
	async toggleMatchMaking(client: Socket) {
		if ((await this.gameService.toggleMatchMaking(client)) == false) {
			client.emit('goBackHome');
			throw new ForbiddenException(
				"You're playing with yourself ! Use local game or get some friends.",
			);
		}
		if (client.data.currentMatch != null) {
			this.server.to(client.data.currentMatch.roomName).emit('gameStarted');
		}
	}

	/**
	 * 				INVITATIONS
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('retrieveInvitations')
	async retrieveInvitations(client: Socket) {
		const properInvit: InvitationEntity[] =
			await this.gameService.getInvitations(client);
		client.emit('sendBackInvite', properInvit);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('sendInvite')
	async sendInvite(client: Socket, userToInviteId: string) {
		await this.gameService.sendInvite(client, userToInviteId);
		this.server.emit('updateInvitation');
		console.log('invite sent');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('acceptInvite')
	async acceptInvite(client: Socket, userInvitingId: string) {
		const currentRoom = await this.gameService.joinInvite(
			client,
			userInvitingId,
		);
		this.server.to(currentRoom).emit('updateInvitation');
		console.log('invite accepted');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('refuseInvite')
	async refuseInvite(client: Socket, userInvitingId: string) {
		const currentRoom = await this.gameService.refuseInvite(
			client,
			userInvitingId,
		);
		this.server.emit('updateInvitation');
		this.server.to(currentRoom).emit('inviteRefused', client.data.user.userId);
		console.log('invite refused');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('inviteIsDeclined')
	async inviteIsDeclined(client: Socket, userInvitedId) {
		await this.gameService.inviteIsDeclined(client, userInvitedId);
	}

	/**
	 *		SPECTATE
	 */

	@UseGuards(WsGuard)
	@SubscribeMessage('spectate')
	async spectate(client: Socket, userIdToSpec: string) {
		await this.gameService.spectate(client, userIdToSpec);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('getCurrentMatch')
	async getCurrentMatch(client: Socket, userIdToSpec: string) {
		if (userIdToSpec === 'me') userIdToSpec = client.data.user.userId;
		if (
			(await this.gameService.getCurrentMatch(client, userIdToSpec)) == true
		) {
			client.emit('sendCurrentMatch', true);
		} else client.emit('sendCurrentMatch', false);
	}

	/*
	______ _____  _____ ______ _   _ _____   _____
 |  ____|  __ \|_   _|  ____| \ | |  __ \ / ____|
 | |__  | |__) | | | | |__  |  \| | |  | | (___
 |  __| |  _  /  | | |  __| | . ` | |  | |\___ \
 | |    | | \ \ _| |_| |____| |\  | |__| |____) |
 |_|    |_|  \_\_____|______|_| \_|_____/|_____/
	/*
	 * ------------------------ GET FRIEND LIST  ------------------------- *
	*/

	@UseGuards(WsGuard)
	@SubscribeMessage('getRelations')
	async getRelations(client: Socket) {
		const relations: RelationEntity[] =
			await this.relationsService.getAllRelations(client.data.user);
		this.server.to(client.id).emit('sendRelations', relations);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('addFriend')
	async addFriend(client: Socket, username: UsernameDto) {
		await this.relationsService.sendFriendRequest(
			username.username,
			client.data.user,
		);
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('blockUser')
	async blockUser(client: Socket, userId: IdDto) {
		await this.relationsService.blockUser(userId.id, client.data.user);
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('unblockUser')
	async unblockUser(client: Socket, relationId: IdDto) {
		await this.relationsService.unblockUser(relationId.id, client.data.user);
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('isBlocked')
	async isBlocked(client: Socket, userId: IdDto) {
		const isBlocked = await this.relationsService.isBlocked(
			userId.id,
			client.data.user,
		);
		this.server.to(client.id).emit('isBlockedRes', isBlocked);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('acceptRequest')
	async acceptRequest(client: Socket, requestId: IdDto) {
		await this.relationsService.respondToFriendRequest(
			requestId.id,
			'accepted',
		);
		this.server.emit('updatedRelations');
	}

	/**
	  _   _ ____  _____ ____
	 | | | / ___|| ____|  _ \
	 | | | \___ \|  _| | |_) |
	 | |_| |___) | |___|  _ <
	  \___/|____/|_____|_| \_\
	 */

	@UseGuards(WsGuard)
	@SubscribeMessage('getMatchHistory')
	async getMatchHistory(client: Socket, userId: string) {
		let user: UserEntity;
		if (userId != 'me') user = await this.userService.getUserById(userId);
		else user = await this.userService.getUserById(client.data.user.userId);
		client.emit(`sendMatchHistory`, user.MatchHistory.slice(-4));
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('getStatistics')
	async getStatistics(client: Socket, userId: string) {
		let user: UserEntity;
		if (userId != 'me') user = await this.userService.getUserById(userId);
		else user = await this.userService.getUserById(client.data.user.userId);
		let ratio: number =
			(user.victories / (user.victories + user.defeats)) * 100;
		if (!ratio) ratio = 0;
		client.emit(`sendStatistics`, {
			victory: user.victories,
			defeat: user.defeats,
			ratio: Math.round(ratio),
		});
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('getAchievements')
	async getAchievements(client: Socket, userId: string) {
		let userAchievements: AchievementsEntity;
		if (userId != 'me')
			userAchievements = await this.gameService.getUserAchievements(userId);
		else
			userAchievements = await this.gameService.getUserAchievements(
				client.data.user.userId,
			);
		client.emit(`sendAchievements`, userAchievements);
	}
}

function jwtDecode<T>(Authentication: any) {
	throw new Error('Function not implemented.');
}
