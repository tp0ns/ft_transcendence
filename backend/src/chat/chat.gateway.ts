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
import { ChatService } from './chat.service';
 
 @WebSocketGateway({
   cors: {
     origin: '*',
   },
 })
 export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
  @WebSocketServer() server: Server;

  constructor(private ChatService: ChatService) {}

  private logger: Logger = new Logger('ChatGateway');
 


  @SubscribeMessage('msgToServer')
  /**
  * ------------------------ HANDLE MESSAGES  ------------------------- *
  */


  /**
   * @todo en plus d'envoyer le msg, stocker dans l'entite messages
   */
  handleMessage(client: Socket, payload: string): void {
    // client.emit('msgToServer', payload);
   this.server.emit('msgToClient', payload);

  }
 
  afterInit(server: Server) {
   this.logger.log('Init');
  }
 

  /**
  * ------------------------ HANDLE CHANNEL ------------------------- *
  */

    /**
     * @todo setup l'admin du channel : fondateur du chan 
     * @todo verifier que le nom du channel n'est pas encore utilise
     * @todo si le password est diff de "" -> besoin de hash 
     */
    createChannel( ) {
      
    }

    /**
     * @todo avoir une fonction getUserbyUsername() 
     */
    addUserInChannel() {

    }

    deleteChannel( ) {
      
    }

  /**
  * ------------------------ DECONNEXION ------------------------- *
  */
  handleDisconnect(client: Socket) {
   this.logger.log(`Client disconnected: ${client.id}`);
  }
 

  /**
  * ------------------------ CONNEXION ------------------------- *
  */
  handleConnection(client: Socket, ...args: any[]) {
   this.logger.log(`Client connected: ${client.id}`);
  }

  /**
  * ------------------------ HANDLE USERS ADMINS ------------------------- *
  */

  changesAdmins( ) {
      
  }

  /**
  * ------------------------ CIRCULATION IN CHANNEL ------------------------- *
  */

  joinChannel() {

  }

  leaveChannel() {

  }

  /**
  * ------------------------ MODIFICATION OF CHANNEL ------------------------- *
  */

  changeTitle() {

  }

  changeBannedUsers() {

  }

  changeMutedUsers() {

  }

 }