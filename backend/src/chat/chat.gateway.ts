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
		origin: 'http://localhost:3000',
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
	async handleConnection(client: Socket) {
		this.logger.log(`Client connected: ${client.id}`);
    this.server.emit('sendChans', await this.channelService.getAllChannels())
	}

	/**
	 * Handles client disconnection behaviour
	 */
	handleDisconnect(client: Socket) {
		this.logger.log(`Client disconnected: ${client.id}`);
	}

	/**
	 * 	CHANNEL EVENTS
	 */

  /**
   * ------------------------ CREATE CHANNEL  ------------------------- *
   */

/**
 * 
 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le set en tant que owner
 * @param channel Pouvoir set les donnees du chan
 * 
 * @todo faire en sorte que lors de la creation d'un nouveau chan, il s'affiche
 * pour tout le monde dans les channels publics si chan public
 */
  @UseGuards(WsGuard)
  @SubscribeMessage('createChan')
  async CreateChan(client: Socket, channelEntity : CreateChanDto) {
    const channel = await this.channelService.createNewChan(client.data.user, channelEntity);
    // if (!channel) {
    //   this.server.emit('errCreatingChan')
    // }
    // else {
      this.server.emit('createdChan', channel);
      this.joinChannel(client, channelEntity.title)
      
    // }

  }

  /**
   * ------------------------ CIRCULATION IN CHANNELS  ------------------------- *
   */


  /**
   * 
   * @param client client qui veut join le chan
   * @param chanName le nom du channel pour pouvoir le retrouver ou bien le cree 
   * 
   */
  @UseGuards(WsGuard)
  @SubscribeMessage('joinChan')
  async joinChannel(client : Socket, channelName : string) {
    await this.channelService.joinChan(client.data.user, channelName);
    client.join(channelName);
    this.server.emit('joinedChan');
  }

  @UseGuards(WsGuard)
  @SubscribeMessage('leaveChan')
  async leaveChannel(client : Socket, channelName : string ) {
    console.log(`ENTER IN LEAAAAAAAAAAAVEJOIN YOOOOOOOO`)
    await this.channelService.leaveChan(client.data.user, channelName);
    client.leave(channelName);
    this.server.emit('leftChan')
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

  /**
   * 
   * @param client 
   * @param payload 
   * 
   * @todo est ce qu'on doit join une room ou on enverra a chaque fois les messages au client ? 
   */
  @SubscribeMessage('msgToUser')
  handleMessagerToClient(client : Socket, payload: string)
  {
    this.server.to(client.data.user.username).emit('directMessage', payload);
  }
}