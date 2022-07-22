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

@WebSocketGateway({
	cors: {
    origin: 'http://localhost/',
  },
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

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

}
