import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import UserEntity from "src/user/models/user.entity";
import { Repository } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";
import { MessagesEntity } from './messages.entity';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessagesEntity) private MessagesRepository: Repository<MessagesEntity>,
		@Inject (forwardRef(() => ChannelEntity)) private channelRepository: Repository<ChannelEntity>,
	) {}


	/**
	 * ------------------------ ADD NEW MESSAGES  ------------------------- *
	 */

	 async addNewMessage(sender: UserEntity, chan: ChannelEntity, msg: string) : Promise<MessagesEntity> 
	 {
		// const message = await this.channelRepository.save({
		// 	user: sender,
		// 	message: msg,
		// })
		let message: MessagesEntity = await this.MessagesRepository.save({
			channel : chan, 
			user: sender,
			message: msg,
		})
		return message;
	}

	// public async sendMessageToChannel(chanIdentifier : string, user : User, msg : string) //: Promise<Channel>
	// {
	// 	const channel : Channel = await this.chanService.getChannelByIdentifier(chanIdentifier);
	// 	if (channel.mutedId.includes(user.id))
	// 		throw (new HttpException('You are mute and cannot send message to channel.', HttpStatus.FORBIDDEN))
	// 	if (channel.bannedId.includes(user.id))
	// 		throw (new HttpException('You are banned and cannot temporary send message to channel.', HttpStatus.FORBIDDEN))
	// 	const newMessage = await this.chatRepo.save({
	// 		sender: user,
	// 		message: msg,
	// 	});
	// 	channel.messages = [...channel.messages, newMessage]; /* if pb of is not iterable, it is because we did not get the
	// 	 ealtions in the find one */
	// 	await channel.save();
	// }
}