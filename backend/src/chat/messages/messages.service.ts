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
		
		// if (channel.bannedId.includes(user.userId))
		// {
		// 	console.log(`t'es banni mon frere`)
		// 	return ;
		// }
		const messages: MessagesEntity[] = await this.MessageRepository
			.createQueryBuilder('messages')
			.leftJoinAndSelect('messages.user', 'sender')
			.leftJoinAndSelect('messages.channel', 'channel')
			.where('channel.channelId = :id', {id : channel.channelId})
			.getMany()

		return messages;

	}
}