import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
 } from '@nestjs/websockets';
 import { Logger } from '@nestjs/common';
 import { Socket, Server } from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: 'https://hoppscotch.io/fr/realtime/socketio/',
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
	 * Handles received message behaviour
	 *
   * @todo en plus d'envoyer le msg, stocker dans l'entite messages
   */
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
   this.server.emit('msgToClient', payload);
  }

}
