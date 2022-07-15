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
import { ChannelService } from './channel/channel.service';
import { CreateChanDto } from './channel/dtos/createChan.dto';

@WebSocketGateway({
	cors: {
		origin: 'https://hoppscotch.io',
	},
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor( private channelService: ChannelService ) {}

	@WebSocketServer() server: Server;

	private logger: Logger = new Logger('ChatGateway');

	/**
	 * Handles server initialization behaviour
	 */
	afterInit(server: Server) {
		this.logger.log(`Server is properly initialized !`);
	}
	/**
	 * Handles client connection behaviour
	 */
	handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
	}

	/**
	 * Handles client disconnection behaviour
	 */
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	/**
	 *==========================CHANNEL EVENTS=================================
	 */

  /**
   * ------ createChan -------
	 *
	 * @returns boolean
	 *    - true : Permet d'envoyer a createdChan pour pouvoir envoyer un msg au user
	 *            lui informant de la bonne realisation du channel.
	 *    - false : Permet d'envoyer a errCreatedChan si le chan n'a pas pu etre cree
	 *            et envoyer un message d'erreur au user.
	 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le set en tant que owner
	 * @param channel Pouvoir set les donnees du chan
	 */
	@UseGuards(WsGuard)
  @SubscribeMessage('createChan')
  async CreateChan(client: Socket, channelEntity : CreateChanDto) {
		const channel = await this.channelService.createNewChan(channelEntity);
    if (!channel)
      this.server.emit('err_createChan', { msg: 'Coucou tu pues' });
    else
      this.server.emit('rtn_createChan', channel);
  }

  /**
	 *==========================MESSAGE EVENTS=================================
   */


  /**
   * @todo en plus d'envoyer le msg, stocker dans l'entite messages
   */
	@UseGuards(WsGuard)
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string) {
		console.log(client.data.user);
		this.server.emit('msgToClient', payload);
		return (payload);
  }

}
