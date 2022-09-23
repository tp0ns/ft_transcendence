import {
	ForbiddenException,
	Logger,
	UseFilters,
	UseGuards,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { jwtConstants } from 'src/auth/jwt/jwt.constants';
import { WsGuard } from 'src/auth/websocket/ws.guard';
import { JoinChanDto } from 'src/chat/channel/dtos/joinChan.dto';
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { MessageService } from 'src/chat/messages/messages.service';
import { AchievementsEntity } from 'src/game/achievements/achievements.entity';
import { invitationInterface } from 'src/game/invitations/invitation.interface';
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
			this.gameService.deleteAllUserInvite(client.data.user.userId);
			// const winnerId: string = await this.gameService.handleGameDisconnect(
			// 	client,
			// );
			// if (winnerId != null) {
			// 	const winner = await this.userService.getUserById(winnerId);
			// 	winner.victories++;
			// 	client.data.user.defeats++;
			// 	await this.gameService.setAchievements(winner);
			// 	await this.gameService.setAchievements(client.data.user);
			// 	// await this.gameService.setMatchHistory(winner, client.data.user, client.data.user.currentMatch);
			// 	this.server
			// 		.to(client.data.user.currentMatch.roomName)
			// 		.emit('victoryOf', winner);
			// 	this.server
			// 		.to(client.data.user.currentMatch.roomName)
			// 		.emit('errorEvent', 'Your opponnent has disconnected.');
			// 	this.server.emit('endGame');
			// }
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
		if (client.data.user)
			await this.userService.playingClient(client.data.user);
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

	/**
	 *  _      ____   _____          _         _____          __  __ ______
	 * | |    / __ \ / ____|   /\   | |       / ____|   /\   |  \/  |  ____|
	 * | |   | |  | | |       /  \  | |      | |  __   /  \  | \  / | |__
	 * | |   | |  | | |      / /\ \ | |      | | |_ | / /\ \ | |\/| |  __|
	 * | |___| |__| | |____ / ____ \| |____  | |__| |/ ____ \| |  | | |____
	 * |______\____/ \_____/_/    \_\______|  \_____/_/    \_\_|  |_|______|
	 *
	 */

	@UseGuards(WsGuard)
	@SubscribeMessage('localGame')
	localGame(client: Socket) {
		this.server.emit('newGame', {
			player1: client.data.user,
			player2: client.data.user,
		});
	}

	/**
	 *   _____          __  __ ______   _____ _   ___      _______ _______    _______ _____ ____  _   _
	 *  / ____|   /\   |  \/  |  ____| |_   _| \ | \ \    / /_   _|__   __|/\|__   __|_   _/ __ \| \ | |
	 * | |  __   /  \  | \  / | |__      | | |  \| |\ \  / /  | |    | |  /  \  | |    | || |  | |  \| |
	 * | | |_ | / /\ \ | |\/| |  __|     | | | . ` | \ \/ /   | |    | | / /\ \ | |    | || |  | | . ` |
	 * | |__| |/ ____ \| |  | | |____   _| |_| |\  |  \  /   _| |_   | |/ ____ \| |   _| || |__| | |\  |
	 *  \_____/_/    \_\_|  |_|______| |_____|_| \_|   \/   |_____|  |_/_/    \_\_|  |_____\____/|_| \_|
	 *
	 */

	/**
	 *
	 * @brief Envoie d'une invitation a jouer
	 *
	 * @param client celui qui envoie l'invitation
	 * @param userToInviteId celui qui doit recevoir l'invitation
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('sendInvite')
	async sendInvite(client: Socket, userToInviteId: string) {
		const response = await this.gameService.sendInvite(client, userToInviteId);
		if (response) throw new ForbiddenException(response);
		this.gameService.deleteReceivedInvite(client.data.user.userId);
		client.emit('receivedInvite');
		this.server.emit('updateInvitation');
	}

	/**
	 * @brief Permet de recuperer les invitations
	 * pour chaque client
	 *
	 * @param client celui qui cherche ses invitations
	 *
	 * -> appel a retrieveInvitations a chaque updateInvitation
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('retrieveInvitations')
	async getInvitations(client: Socket) {
		if (client.data.user.status === 'disconnected')
			await this.userService.connectClient(client.data.user);
		const properInvit = this.gameService.getInvitations(client.data.user);
		client.emit('sendBackInvite', properInvit);
		this.server.emit('updatedRelations');
	}

	/**
	 * @brief Si le joueur invite accepte l'invitation
	 *
	 * @param client celui qui accepte
	 * @param invitationId l'invitation concernee
	 *
	 * -> creation de la room
	 * -> suppression de toutes les autres invitations
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('acceptInvite')
	async acceptInvite(client: Socket, invitationId: string) {
		const invite = this.gameService.acceptInvite(
			client.data.user,
			invitationId,
		);
		this.server.to(invite.id).emit('matchAccepted', invite.roomId);
		client.emit('matchAccepted', invite.roomId);
		client.emit('updateInvitation');
		this.gameService.deleteReceivedInvite(client.data.user.userId);
		this.initGame(invite);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('joinGame')
	joinGame(client: Socket, roomId: string) {
		client.join(roomId);
		this.gameService.setMatch(client.data.user, roomId);
	}

	/**
	 *
	 * @brief Refus de l'invitation
	 *
	 * @param client celui qui refuse
	 * @param invitationId l'invitation concernee
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('refuseInvite')
	async refuseInvite(client: Socket, invitationId: string) {
		this.gameService.refuseInvite(invitationId);
		this.server.emit('updateInvitation');
		// this.server.to(currentRoom).emit('inviteRefused', client.data.user.userId);
	}

	/**
	 *
	 * @brief Permet de determiner si une invitation a ete refuse ou non
	 *
	 * @param client le user en attente d'une reponse a une invit
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('needWaiting')
	needWaiting(client: Socket) {
		const waiting: boolean = this.gameService.needWaiting(
			client.data.user.userId,
		);
		client.emit('waiting', waiting);
	}

	/**
	 * @brief Si un joueur qui a envoye une invitation
	 * quitte la partie ou si un joueur refuse une invitation
	 * => annulation de l'invit
	 * @param client personne concernee par l'annulation
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('deleteInvitation')
	async deleteInvitation(client: Socket) {
		//  await this.gameService.deleteInvitation(client.data.user);
		this.server.emit('updateInvitation');
	}

	/**
	 * __  __       _______ _____ _    _   __  __          _  _______ _   _  _____
	 * |  \/  |   /\|__   __/ ____| |  | | |  \/  |   /\   | |/ /_   _| \ | |/ ____|
	 * | \  / |  /  \  | | | |    | |__| | | \  / |  /  \  | ' /  | | |  \| | |  __
	 * | |\/| | / /\ \ | | | |    |  __  | | |\/| | / /\ \ |  <   | | | . ` | | |_ |
	 * | |  | |/ ____ \| | | |____| |  | | | |  | |/ ____ \| . \ _| |_| |\  | |__| |
	 * |_|  |_/_/    \_\_|  \_____|_|  |_| |_|  |_/_/    \_\_|\_\_____|_| \_|\_____|
	 *
	 */

	@UseGuards(WsGuard)
	@SubscribeMessage('matchmaking')
	matchmaking(client: Socket) {
		const matchMaking = this.gameService.matchmaking(client);
		if (!matchMaking) return client.emit('waitingMatchmaking');
		this.server.to(matchMaking.id).emit('matchAccepted', matchMaking.roomId);
		client.emit('matchAccepted', matchMaking.roomId);
		this.initGame(matchMaking);
	}

	/**
	 *  _____ _____  ______ _____ _______    _______ ______
	 * / ____|  __ \|  ____/ ____|__   __|/\|__   __|  ____|
	 *| (___ | |__) | |__ | |       | |  /  \  | |  | |__
	 * \___ \|  ___/|  __|| |       | | / /\ \ | |  |  __|
	 * ____) | |    | |___| |____   | |/ ____ \| |  | |____
	 *|_____/|_|    |______\_____|  |_/_/    \_\_|  |______|
	 *
	 */

	@UseGuards(WsGuard)
	@SubscribeMessage('spectate')
	spectate(client: Socket) { }

	/**
	 *		SPECTATE
	 */
	@SubscribeMessage('joinDummyGame')
	dummyGame(client: Socket, roomId: string) {
		client.join(roomId);
		let game: Game = this.gameService.initDummyGame(roomId, client.data.user);
		if (game.player1 && game.player2)
			this.server.to(roomId).emit('updatedGame', game)
	}

	initGame(invitation: invitationInterface) {
		let game: Game = this.gameService.initGame(invitation);
		this.server.to(game.id).emit('updatedGame', game);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('movePad')
	movePad(client: Socket, { roomId, direction }) {
		let game: Game = this.gameService.movePad(client.data.user, direction, roomId);
		this.server.to(roomId).emit('updatedGame', game);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('gameLoop')
	gameLoop(client: Socket, { roomId, state }) {
		this.gameService.gameLoop(this.server, roomId, state);
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
