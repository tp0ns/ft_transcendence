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
 
 @WebSocketGateway({
   cors: {
     origin: 'https://hoppscotch.io',
   },
 })
 export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
 
  @WebSocketServer() server: Server;

  constructor(private ChatService: ChannelService) {}

  private logger: Logger = new Logger('ChatGateway');
 


  /**
   * ------------------------ CREATE CHANNEL  ------------------------- *
   */

/**
 * 
 * @returns boolean 
 *    - true : Permet d'envoyer a createdChan pour pouvoir envoyer un msg au user 
 *            lui informant de la bonne realisation du channel.
 *    - false : Permet d'envoyer a errCreatedChan si le chan n'a pas pu etre cree 
 *            et envoyer un message d'erreur au user. 
 * @param client Besoin d'envoyer le user qui a cree le channel pour pouvoir le set en tant que owner
 * @param channel Pouvoir set les donnees du chan
 */
  @SubscribeMessage('createChan')
  async CreateChan(client: Socket, channelEntity : CreateChanDto) {
    console.log('suodgfosugdofgus')
    const channel = await this.ChatService.createNewChan(channelEntity);
    if (!channel) {
      this.server.emit('errCreatingChan', {
        msg: 'Coucou tu pues'
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
  }

}
