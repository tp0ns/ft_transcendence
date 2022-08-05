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
import { ChannelService } from './chat/channel/channel.service';
import { CreateChanDto } from './chat/channel/dtos/createChan.dto';
import UserEntity from 'src/user/models/user.entity';
import { ChannelEntity } from './chat/channel/channel.entity';
import { GameService } from './game/game.service';
import { Match } from './game/interfaces/game.interface';
import { ModifyChanDto } from './chat/channel/dtos/modifyChan.dto';
import { channel } from 'diagnostics_channel';

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
		const channel = await this.channelService.createNewChan(
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
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('joinRoom')
	async joinRoom(client: Socket, channelName: string) {
		let check: boolean = await this.channelService.checkIfUserInChannel(
			client.data.user,
			channelName,
		);
		if (check == true) {
			client.join(channelName);
			this.server.emit('joinedRoom');
		}
		else
		console.log(`You need to be a member of the channel`);
	}

	/**
	 *
	 * @param client client qui veut leave le chan
	 * @param channelName le nom du channel pour pouvoir le retrouver ou bien le cree
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('leaveRoom')
	async leaveRoom(client: Socket, channelName: string) {
		let check: boolean = await this.channelService.checkIfUserInChannel(
			client.data.user,
			channelName,
		);
		if (check == true) {
			client.leave(channelName);
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
	async sendDefaultPos(socket: Socket) {
		this.server.emit(
			'setPosition',
			this.beginMatch.leftPad,
			this.beginMatch.rightPad,
			this.beginMatch.ball,
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
		);
	}
}
