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
// import { WsGuard } from 'src/auth/websocket/ws.guard';

@WebSocketGateway({
	cors: {
		origin: 'https://hoppscotch.io',
	},
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

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
	 * 	CHANNEL EVENTS
	 */



	/**
	 * MESSAGE EVENTS
	 */
  /**
	 * Handles received message behaviour
	 *
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
