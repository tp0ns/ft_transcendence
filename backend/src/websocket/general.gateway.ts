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
import { MessagesEntity } from 'src/chat/messages/messages.entity';
import { globalExceptionFilter } from 'src/globalException.filter';
import { JoinChanDto } from 'src/chat/channel/dtos/joinChan.dto';
import { UserService } from 'src/user/user.service';
import { Ball, Match } from '../game/interfaces/game.interface';
import { IdDto, UsernameDto } from './dtos/Relations.dto';

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
	) {}

	@WebSocketServer() server: Server;

	private logger: Logger = new Logger('GeneralGateway');
	private beginMatch: Match = this.gameService.setDefaultPos();

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
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
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
	 * @todo est ce que je dois verifier si le cryptage des 2 mdp est equivalent?
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
	 *
	 * @param client client qui veut join le chan
	 * @param chanName le nom du channel pour pouvoir le retrouver ou bien le cree
	 *
	 * @todo mettre l'erreur dans le service
	 * @todo faire en sorte de recuperer tous les messages du channel
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('joinRoom')
	async joinRoom(client: Socket, channel: ChannelEntity) {
		// let check: boolean = await this.channelService.getIfUserInChan(
		// 	client.data.user,
		// 	channel,
		// );
		// if (check == true)
		// {
		client.join(channel.channelId);
		this.server.emit('joinedRoom');
		// }
		// else
		// console.log(`You need to be a member of the channel`);
	}

	/**
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
	 * @todo envoyer au service les 2 arguments decomposes
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToChannel')
	async handleMessageToChan(client: Socket, payload: string[]) {
		const chanId: string = payload[1];
		const new_msg = await this.channelService.sendMessage(
			client.data.user,
			payload,
		);
		const messages = await this.messageService.getChannelMessages(
			client.data.user,
			chanId,
		);
		// this.server.emit('updatedChannels');
		this.server.to(chanId).emit('sendChannelMessages', messages);
	}

	/**
	 * DIRECT MESSAGE
	 * @param client
	 * @param payload
	 *
	 * @todo est ce qu'on doit join une room ou on enverra a chaque fois les messages au client ?
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
	 * Pour recuperer tous les channels existant
	 * @param client
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('getAllChannels')
	async getChannels(client: Socket) {
		const channels: ChannelEntity[] =
			await this.channelService.getAllChannels();
		client.emit('sendChans', channels);
	}

	/**
	 * Pour ne recuperer que les channels dont le user fait partie
	 * -> autant publiques que privees
	 * @param client
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('getMemberChannels')
	async getMemberChannels(client: Socket) {
		const channels: ChannelEntity[] =
			await this.channelService.getMemberChannels(client.data.user);
		client.emit('sendMemberChans', channels);
	}

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
		if (this.beginMatch.p1User == null) {
			this.beginMatch.player1 = client.data.user;
			this.beginMatch.p1User = this.beginMatch.player1;
			// eslint-disable-next-line prettier/prettier
		} else if (
			this.beginMatch.p2User == null &&
			this.beginMatch.p1User != client.data.user
		) {
			this.beginMatch.player2 = client.data.user;
			this.beginMatch.p2User = this.beginMatch.player2;
		}
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
			this.beginMatch.p1Score,
			this.beginMatch.p2Score,
		);
	}

	// Move event, allow the user to move its pad
	@UseGuards(WsGuard)
	@SubscribeMessage('move')
	async move(client: Socket, direction: string) {
		await this.gameService.movePad(direction, this.beginMatch);
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
			this.beginMatch.p1Score,
			this.beginMatch.p2Score,
		);
	}

	// Move event, allow the user to move its pad with mouse
	@UseGuards(WsGuard)
	@SubscribeMessage('mouseMove')
	async mouseMove(client: Socket, mousePosy: number) {
		if (client.data.user.userId == this.beginMatch.player1.userId)
			await this.gameService.moveMouseLeft(mousePosy, this.beginMatch);
		else if (client.data.user.userId == this.beginMatch.player2.userId)
			await this.gameService.moveMouseRight(mousePosy, this.beginMatch);
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
			this.beginMatch.p1Score,
			this.beginMatch.p2Score,
		);
	}

	//	Game Functions, start, reset
	@UseGuards(WsGuard)
	@SubscribeMessage('gameFunctions')
	async gameFunctions(client: Socket, payload) {
		await this.gameService.gameFunction(
			payload[0], //function
			payload[1], //score
			this.beginMatch,
		);
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
			this.beginMatch.p1Score,
			this.beginMatch.p2Score,
		);
	}

	// get the position of the ball and emit it
	@UseGuards(WsGuard)
	@SubscribeMessage('ballMovement')
	async ballMovement(client: Socket, ballPosition: Ball) {
		this.beginMatch.ball = ballPosition;
		this.beginMatch.p1Touches = this.beginMatch.ball.p1Touches;
		this.beginMatch.p2Touches = this.beginMatch.ball.p2Touches;
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
			this.beginMatch.p1Score,
			this.beginMatch.p2Score,
		);
	}

	//able keyboard commands for local game
	@UseGuards(WsGuard)
	@SubscribeMessage('toggleLocalGame')
	async toggleSinglePlayer(client: Socket) {
		await this.gameService.toggleLocalGame(this.beginMatch);
	}

	//disable keyboard commands for local game
	@UseGuards(WsGuard)
	@SubscribeMessage('toggleMatchMaking')
	async toggleMatchMaking(client: Socket) {
		await this.gameService.toggleMatchMaking(this.beginMatch);
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
	async blockUser(client: Socket, username: UsernameDto) {
		await this.relationsService.blockUser(username.username, client.data.user);
		this.server.emit('updatedRelations');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('unblockUser')
	async unblockUser(client: Socket, relationId: IdDto) {
		await this.relationsService.unblockUser(relationId.id, client.data.user);
		this.server.emit('updatedRelations');
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
}
