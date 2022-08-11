import {
	SubscribeMessage,
	WebSocketGateway,
	OnGatewayInit,
	WebSocketServer,
	OnGatewayConnection,
	OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { WsGuard } from 'src/auth/websocket/ws.guard';
import { ChannelService } from '../chat/channel/channel.service';
import { CreateChanDto } from '../chat/channel/dtos/createChan.dto';
import { ChannelEntity } from '../chat/channel/channel.entity';
import { ModifyChanDto } from '../chat/channel/dtos/modifyChan.dto';
import { GameService } from '../game/game.service';
import { Ball, Match } from '../game/interfaces/game.interface';

@WebSocketGateway({
	cors: {
		origin: 'http://localhost/',
	},
})
export class GeneralGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(
		private channelService: ChannelService,
		private gameService: GameService,
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
	 * ------------------------ CREATE/MODIFY/DELETE CHANNEL  ------------------------- *
	 */

	/**
	 *
	 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le
	 * set en tant que owner
	 * @param channel Pouvoir set les donnees du chan
	 * @emits updatedChannels permet au front de savoir qu'il est temps de
	 * recuperer les channels
	 *
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('createChan')
	async CreateChan(client: Socket, channelEntity: CreateChanDto) {
		const channel: ChannelEntity = await this.channelService.createNewChan(
			client.data.user,
			channelEntity,
		);
		this.server.emit('updatedChannels');
	}

	/**
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
	@SubscribeMessage('modifyChannel')
	async modifyChannel(client: Socket, modifications: ModifyChanDto) {
		await this.channelService.modifyChannel(client.data.user, modifications);
		this.server.emit('updatedChannels');
	}

	/**
	 *
	 * @param client pour checker si le user qui souhaite modifier le channel a
	 * les droits
	 * @param chanName nom du channel a supprimer
	 * @emits updatedChannels permet au front de savoir qu'il est temps de
	 * recuperer les channels
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('deleteChan')
	async deleteChan(client: Socket, chanName: string) {
		await this.channelService.deleteChan(client.data.user, chanName);
		this.server.emit('updatedChannels');
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
			client.join(channel.title);
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
	async leaveRoom(client: Socket, channel : ChannelEntity) {
		let check: boolean = await this.channelService.getIfUserInChan(
			client.data.user,
			channel,
		);
		if (check == true) {
			client.leave(channel.title);
			this.server.emit('leftRoom');
		}
	}

	/**
	 * ------------------------ HANDLE MESSAGES  ------------------------- *
	 */

	/**
	 * MESSAGE POUR LE SERVEUR
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, payload: string) {
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
	 * @todo faire un emit.to
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToChannel')
	handleMessageToChan(client: Socket, payload: string) {
		client.join(payload[0]);
		this.channelService.sendMessage(client.data.user, payload);
		// this.server.to(chanName).emit('channelMessage', payload);
		this.server.emit('channelMessage', payload);
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
	handleMessagerToClient(client: Socket, payload: string) {
		this.server.to(client.data.user.username).emit('directMessage', payload);
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
		this.server.emit('sendChans', channels);
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
		this.server.emit('sendMemberChannels', channels);
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
		}
		else if (this.beginMatch.p2User == null && this.beginMatch.p1User != client.data.user) {
			this.beginMatch.player2 = client.data.user;
			this.beginMatch.p2User = this.beginMatch.player2;
		}
		console.log('beginMatch', this.beginMatch);
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
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
			this.beginMatch.p1Score,
			this.beginMatch.p2Score,
		);
	}
}
