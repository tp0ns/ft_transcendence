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

@WebSocketGateway({
	cors: {
		origin: 'http://localhost/',
	},
})
export class GeneralGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	constructor(private channelService: ChannelService) {}

	@WebSocketServer() server: Server;

	private logger: Logger = new Logger('GeneralGateway');

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
	 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le set en tant que owner
	 * @param channel Pouvoir set les donnees du chan
	 * 
	 * @todo verifier que channelEntity existe : est-ce que securite dans le front ? 
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

	@UseGuards(WsGuard)
	@SubscribeMessage('modifyPassword')
	async modifyPassword(client: Socket, chanName: string, newPassword : string)
	{
		await this.channelService.modifyPassword(client.data.user, chanName, newPassword);
		this.server.emit('updatedChannels');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('modifyAdmins')
	async modifyAdmins(client : Socket, chanName: string, newAdmins: UserEntity[])
	{
		await this.channelService.modifyAdmins(client.data.user, chanName, newAdmins);
		this.server.emit('updatedChannels');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('modifyMembers')
	async modifyMembers(client : Socket, chanName: string, newMembers: UserEntity[])
	{
		await this.channelService.modifyMembers(client.data.user, chanName, newMembers)
		this.server.emit('updatedChannels');

	}

	@UseGuards(WsGuard)
	@SubscribeMessage('deleteChan')
	async deleteChan(client: Socket, chanName: string)
	{
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
	 * @todo si le channel est private, verifier que le user est bien membre du channel avant de rejoindre la room
	 *
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('joinRoom')
	async joinRoom(client: Socket, channelName: string) {
		client.join(channelName);
		this.server.emit('joinedRoom');
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('leaveRoom')
	async leaveRoom(client : Socket, channelName : string ) {
		client.leave(channelName);
		this.server.emit('leftRoom')
	}
  
	/**
	 * ------------------------ BAN / MUTE  ------------------------- *
	 */

	@UseGuards(WsGuard)
	@SubscribeMessage('BanUser')
	async BanUser(client: Socket, userToBan: UserEntity, chanName: string)
	{
		await this.channelService.banUser(client.data.user, userToBan, chanName);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('MuteUser')
	async MuteUser(client: Socket, userToMute: UserEntity, chanName: string)
	{
		await this.channelService.muteUser(client.data.user, userToMute, chanName);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('UnbanUser')
	async UnbanUser(client: Socket, userToUnban: UserEntity, chanName: string)
	{
		await this.channelService.unbanUser(client.data.user, userToUnban, chanName);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('UnmuteUser')
	async UnmuteUser(client: Socket, userToUnmute: UserEntity, chanName: string)
	{
		await this.channelService.unmuteUser(client.data.user, userToUnmute, chanName);
	}

	
	/**
	 * ------------------------ HANDLE MESSAGES  ------------------------- *
	 */

  /**
   * @todo en plus d'envoyer le msg, stocker dans l'entite messages
   */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToServer')
	handleMessage(client: Socket, payload: string) {
		this.server.emit('msgToClient', payload);
		return payload;
	}

	/**
	 * 
	 * @param client 
	 * @param payload 
	 * @param chanName 
	 * 
	 * @todo faire un emit.to
	 */
	@UseGuards(WsGuard)
	@SubscribeMessage('msgToChannel')
	handleMessageToChan(client: Socket, payload: string, chanName: string) {
		client.join(chanName);
		this.channelService.sendMessage(client.data.user, payload, chanName);
		// this.server.to(chanName).emit('channelMessage', payload);
		this.server.emit('channelMessage', payload);
	}

	/**
	 *
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

	@UseGuards(WsGuard)
	@SubscribeMessage('getAllChannels')
	async getChannels(client: Socket) {
		const channels: ChannelEntity[] =
			await this.channelService.getAllChannels();
		this.server.emit('sendChans', channels);
	}

	@UseGuards(WsGuard)
	@SubscribeMessage('getMemberChannels')
	async getMemberChannels(client: Socket)
	{
		const channels: ChannelEntity[] = await this.channelService.getMemberChannels(client.data.user);
	}

	// @UseGuards(WsGuard)
	// @SubscribeMessage('getAllPublicChannels')
	// async GetAllPublicChannels(client: Socket)
	// {
	// 	const publicChannels: ChannelEntity[] = await this.channelService.getAllPublicChannels();
	// 	this.server.emit('sendPublicsChannels', publicChannels);
	// }

	// @UseGuards(WsGuard)
	// @SubscribeMessage('getAllPrivateChannels')
	// async getAllPrivateChannels(client: Socket)
	// {
	// 	const privateChannels: ChannelEntity[] = await this.channelService.getAllPrivateChannels(client.data.user);
	// 	this.server.emit('sendPrivateChannels', privateChannels);
	// }

/**
*   _____          __  __ ______ 
*  / ____|   /\   |  \/  |  ____|
* | |  __   /  \  | \  / | |__   
* | | |_ | / /\ \ | |\/| |  __|  
* | |__| |/ ____ \| |  | | |____ 
*  \_____/_/    \_|_|  |_|______|																				   
* 
*/
																				

 
}
