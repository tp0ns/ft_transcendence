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
    origin: 'http://localhost/',
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
   * ------------------------ CREATE CHANNEL  ------------------------- *
   */

/**
 *
 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le set en tant que owner
 * @param channel Pouvoir set les donnees du chan
 *
 * @todo verifier que le user dans le channel fonctionne
 */
  @UseGuards(WsGuard)
  @SubscribeMessage('createChan')
  async CreateChan(client: Socket, channelEntity : CreateChanDto) {
    const channel = await this.channelService.createNewChan(client.data.user, channelEntity);
    // if (!channel) {
    //   this.server.emit('errCreatingChan')
    // }
    // else {
      this.joinChannel(client.data.user, channelEntity.title);
      this.server.emit('createdChan', channel)
    // }

  }

  /**
   * ------------------------ CIRCULATION IN CHANNELS  ------------------------- *
   */


  /**
   *
   * @param client client qui veut join le chan
   * @param chanName le nom du channel pour pouvoir le retrouver ou bien le cree
   */
  @UseGuards(WsGuard)
  @SubscribeMessage('joinChannel')
  joinChannel(client : Socket, chanName: string) {
    this.channelService.joinChan(client.data.user, chanName);
    this.server.emit('joinedChan');
    client.join(chanName);
  }


  /**
   * ------------------------ HANDLE MESSAGES  ------------------------- *
   */


  /**
   * @todo en plus d'envoyer le msg, stocker dans l'entite messages
   */
	// @UseGuards(WsGuard)
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string) {
		this.server.emit('msgToClient', payload);
		return (payload);
  }

  @SubscribeMessage('msgToChannel')
  handleMessageToChan(client : Socket, payload: string, chanName: string) {
    client.join(chanName);
    this.server.to(chanName).emit('channelMessage', payload);
  }


}
