import {
	ForbiddenException,
	Logger,
	UseFilters,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
	OnGatewayConnection,
	OnGatewayDisconnect, OnGatewayInit, SubscribeMessage,
	WebSocketGateway, WebSocketServer, WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from 'src/auth/jwt/jwt.constants';
import { WsGuard } from 'src/auth/websocket/ws.guard';
import { JoinChanDto } from 'src/chat/channel/dtos/joinChan.dto';
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { MessageService } from 'src/chat/messages/messages.service';
import { AchievementsEntity } from 'src/game/achievements/achievements.entity';
import InvitationEntity from 'src/game/invitations/invitations.entity';
import { globalExceptionFilter } from 'src/globalException.filter';
import RelationEntity from 'src/relations/models/relations.entity';
import { RelationsService } from 'src/relations/relations.service';
import UserEntity from 'src/user/models/user.entity';
import { UserService } from 'src/user/user.service';
import { ChannelEntity } from '../chat/channel/channel.entity';
import { ChannelService } from '../chat/channel/channel.service';
import { CreateChanDto } from '../chat/channel/dtos/createChan.dto';
import { ModifyChanDto } from '../chat/channel/dtos/modifyChan.dto';
import { GameService } from '../game/game.service';
import { Ball, Game } from '../game/interfaces/game.interface';
import { IdDto, UsernameDto } from './dtos/Relations.dto';

@UseFilters(globalExceptionFilter)
@WebSocketGateway({
	cors: {
		origin: '/',
	},
})
export class GeneralGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private channelService: ChannelService,
		private gameService: GameService,
		private relationsService: RelationsService,
		private messageService: MessageService,
		private userService: UserService,
		private readonly jwtService: JwtService,
	) { }

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

	/**
	 * Handles client connection behaviour
	 */
	@UseGuards(WsGuard)
	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
		this.server.emit('updatedChannels');
	}

	/**
	 * Handles client disconnection behaviour
	 */
	@UseGuards(WsGuard)
	async handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
		if (client.data.user) {
			// 	const winnerId: string = await this.gameService.handleGameDisconnect(
			// 		client,
			// 	);
			// 	if (winnerId != null) {
			// 		const winner = await this.userService.getUserById(winnerId);
			// 		winner.victories++;
			// 		client.data.user.defeats++;
			// 		await this.gameService.setAchievements(winner);
			// 		await this.gameService.setAchievements(client.data.user);
			// 		// await this.gameService.setMatchHistory(winner, client.data.user, client.data.user.currentMatch);
			// 		this.server
			// 			.to(client.data.user.currentMatch.roomName)
			// 			.emit('victoryOf', winner);
			// 		this.server
			// 			.to(client.data.user.currentMatch.roomName)
			// 			.emit('errorEvent', 'Your opponnent has disconnected.');
			// 		this.server.emit('endGame');
			// 	}
			this.server.emit('updateInvitation');
			this.userService.disconnectClient(client.data.user);
		}
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('leaving')
	async handleLeaving(client: Socket) {
		if (client.data.user)
			await this.userService.disconnectClient(client.data.user);
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('playing')
	async handlePlaying(client: Socket) {
		if (client.data.user) await this.userService.playingClient(client.data.user);
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

	@UseGuards(WsGuard)
	@SubscribeMessage('joinDummyGame')
	dummyGame(client: Socket, roomId: string) {
		client.join(roomId);
		let game: Game = this.gameService.initDummyGame(roomId, client.data.user);
		if (game.player1 && game.player2)
			this.server.to(roomId).emit('updatedGame', game)
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('createGame')
	initGame(client: Socket, roomId: string) {
		let game: Game = this.gameService.initGame(roomId);
		this.server.to(roomId).emit('updatedGame', game);
	}

	// /**
	//  * 				INVITATIONS
	//  */
	// @UseGuards(WsGuard)
	// @SubscribeMessage('retrieveInvitations')
	// async retrieveInvitations(client: Socket) {
	// 	if (client.data.user.status === "disconnected")
	// 		await this.userService.connectClient(client.data.user);
	// 	const properInvit: InvitationEntity[] =
	// 		await this.gameService.getInvitations(client);
	// 	this.server.emit('updatedRelations');
	// 	client.emit('sendBackInvite', properInvit);
	// }

	// @UseGuards(WsGuard)
	// @SubscribeMessage('sendInvite')
	// async sendInvite(client: Socket, userToInviteId: string) {
	// 	await this.gameService.sendInvite(client, userToInviteId);
	// 	this.server.emit('updateInvitation');
	// 	client.emit('pendingInvitation');
	// 	console.log('invite sent');
	// }

	// @UseGuards(WsGuard)
	// @SubscribeMessage('acceptInvite')
	// async acceptInvite(client: Socket, userInvitingId: string) {
	// 	const currentRoom = await this.gameService.joinInvite(
	// 		client,
	// 		userInvitingId,
	// 	);
	// 	this.server.to(currentRoom).emit('updateInvitation');
	// 	console.log('invite accepted');
	// }

	// @UseGuards(WsGuard)
	// @SubscribeMessage('refuseInvite')
	// async refuseInvite(client: Socket, userInvitingId: string) {
	// 	const currentRoom = await this.gameService.refuseInvite(
	// 		client,
	// 		userInvitingId,
	// 	);
	// 	this.server.emit('updateInvitation');
	// 	this.server.to(currentRoom).emit('inviteRefused', client.data.user.userId);
	// 	console.log('invite refused');
	// }

	// @UseGuards(WsGuard)
	// @SubscribeMessage('inviteIsDeclined')
	// async inviteIsDeclined(client: Socket, userInvitedId) {
	// 	await this.gameService.inviteIsDeclined(client, userInvitedId);
	// }

	// /**
	//  *		SPECTATE
	//  */

	// @UseGuards(WsGuard)
	// @SubscribeMessage('spectate')
	// async spectate(client: Socket, userIdToSpec: string) {
	// 	await this.gameService.spectate(client, userIdToSpec);
	// }

	// @UseGuards(WsGuard)
	// @SubscribeMessage('getCurrentMatch')
	// async getCurrentMatch(client: Socket, userIdToSpec: string) {
	// 	if (userIdToSpec === 'me') userIdToSpec = client.data.user.userId;
	// 	if (
	// 		(await this.gameService.getCurrentMatch(client, userIdToSpec)) == true
	// 	) {
	// 		client.emit('sendCurrentMatch', true);
	// 	} else client.emit('sendCurrentMatch', false);
	// }

	// /**
	//  * User State in game
	//  */
	// @UseGuards(WsGuard)
	// @SubscribeMessage('isInGame')
	// async isInGame(client: Socket) {
	// 	const ret: boolean = await this.gameService.isInGame(client);
	// 	client.emit('isDisplayGame', ret);
	// }

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

	// 	@UseGuards(WsGuard)
	// 	@SubscribeMessage('getAchievements')
	// 	async getAchievements(client: Socket, userId: string) {
	// 		let userAchievements: AchievementsEntity;
	// 		if (userId != 'me')
	// 			userAchievements = await this.gameService.getUserAchievements(userId);
	// 		else
	// 			userAchievements = await this.gameService.getUserAchievements(
	// 				client.data.user.userId,
	// 			);
	// 		client.emit(`sendAchievements`, userAchievements);
	// 	}
}
