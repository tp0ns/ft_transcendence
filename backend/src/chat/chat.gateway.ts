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
import { ChannelService } from './channel/channel.service';
import { CreateChanDto } from './channel/CreateChan.dto';
import { channel } from 'diagnostics_channel';
 
 @WebSocketGateway({
   cors: {
     origin: 'https://hoppscotch.io',
   },
 })
 export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
  @WebSocketServer() server: Server;

  constructor(private ChannelService: ChannelService) {}

  private logger: Logger = new Logger('ChatGateway');
 


  /**
   * ------------------------ CREATE CHANNEL  ------------------------- *
   */

/**
 * 
 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le set en tant que owner
 * @param channel Pouvoir set les donnees du chan
 * 
 * @todo ajouter le user dans le channel
 */
  @SubscribeMessage('createChan')
  async CreateChan(client: Socket, channelEntity : CreateChanDto) {
    const channel = await this.ChannelService.createNewChan(channelEntity);
    if (!channel) {
      this.server.emit('errCreatingChan', {
      })
    }
    else {
      this.server.emit('createdChan', channel)
    }

  }

  /**
   * ------------------------ HANDLE MESSAGES  ------------------------- *
   */
  
  
  /**
   * @todo en plus d'envoyer le msg, stocker dans l'entite messages
   */
  @SubscribeMessage('msgToServer')
  handleMessage(client: Socket, payload: string): void {
    this.server.emit('msgToClient', payload);
    // this.wss.to(message.room).emit('msgToClient', payload);
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


  /**
   * 
   * @param client va permettre d'envoyer les infos du user qui souhaite rejoindre la room
   * @param channelName permet de trouver l'instance de channel que souhaite rejoindre le user
   * 
   * @todo ajouter le user pour pouvoir tester
   * @todo besoin d'envoyer un message au user pour le prevenir qu'il a bien rejoint le chan
   */
  @SubscribeMessage('joinChannel')
  joinChannel(client: Socket, channelName : string) {
    this.ChannelService.joinRoom(channelName);
    // this.logger.log(`JoinRoom : ${client.id}`)
    // this.server.emit('joinedRoom', channel)
    // client.join(room);
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