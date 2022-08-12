import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import UserEntity from "src/user/models/user.entity";
import { Repository } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";
import { ChannelService } from "../channel/channel.service";
import { MessagesEntity } from './messages.entity';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessagesEntity) private MessageRepository: Repository<MessagesEntity>,
		@Inject(forwardRef(() => ChannelService)) private channelService: ChannelService,
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
		const message: MessagesEntity = await this.MessageRepository.save({
			channel : chan, 
			user: sender,
			message: msg,
		})
		return message;
	}

	async getChannelMessages(user: UserEntity, chanName: string) : Promise<MessagesEntity[]>
	{
		let channel: ChannelEntity = await this.channelService.getChanByName(chanName);
		const messages: MessagesEntity[] = await this.MessageRepository
			.createQueryBuilder('messages')
			.leftJoinAndSelect('messages.user', 'sender')
			.leftJoinAndSelect('messages.channel', 'channel')
			.where('channel.channelId = :id', {id : channel.channelId})
			.getMany()

		return messages;

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