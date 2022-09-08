import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import RelationEntity from 'src/relations/models/relations.entity';
import { RelationsService } from 'src/relations/relations.service';
import UserEntity from 'src/user/models/user.entity';
import { Repository } from 'typeorm';
import { ChannelEntity } from '../channel/channel.entity';
import { ChannelService } from '../channel/channel.service';
import { MessagesEntity } from './messages.entity';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessagesEntity)
		private MessageRepository: Repository<MessagesEntity>,
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,
		@Inject(forwardRef(() => RelationsService))
		private relationsService: RelationsService,
	) {}

	/**
	 * ------------------------ ADD NEW MESSAGES  ------------------------- *
	 */

	async addNewMessage(
		sender: UserEntity,
		chan: ChannelEntity,
		msg: string,
	): Promise<MessagesEntity> {
		// const message = await this.channelRepository.save({
		// 	user: sender,
		// 	message: msg,
		// })
		const message: MessagesEntity = await this.MessageRepository.save({
			channel: chan,
			user: sender,
			message: msg,
		});
		return message;
	}

	async getChannelMessages(
		user: UserEntity,
		chanName: string,
	): Promise<MessagesEntity[]> {
		let channel: ChannelEntity = await this.channelService.getChanByName(
			chanName,
		);
		let messages: MessagesEntity[];
		let userRelations: RelationEntity =
			await this.relationsService.getAllRelations(user);
		if (channel) {
			if (channel.bannedMembers && channel.bannedId.includes(user.userId))
				return null;

			messages = await this.MessageRepository.createQueryBuilder('messages')
				.leftJoinAndSelect('messages.user', 'sender')
				.leftJoinAndSelect('messages.channel', 'channel')
				.where('channel.channelId = :id', { id: channel.channelId })
				.getMany();
			return messages;
		}
	}
}

// public async getMessage(chanIdentifier: string, user: User) : Promise<Channel>
// {
// 	let msgs: Channel;
// 	if (user.blocked.length > 0)
// 	{
// 		msgs = await this.chanRepo.createQueryBuilder("chan")
// 			.where("chan.name = :chanName", { chanName: chanIdentifier })
// 			.leftJoinAndSelect("chan.messages", "messages")
// 			.leftJoinAndSelect("messages.sender", "sender")
// 			.orderBy("messages.id", "ASC")
// 			.andWhere("sender.id NOT IN (:...blocked)", { blocked: user.blocked }) // make the query null if no messages
// 			.getOne()

// 		if (msgs == null) msgs = await this.chanRepo.createQueryBuilder("chan").where("chan.name = :chanName", { chanName: chanIdentifier }).getOne();

// 	}
// 	else
// 	{
// 		 msgs = await this.chanRepo.createQueryBuilder("chan").where("chan.name = :chanName", { chanName: chanIdentifier })
// 			 .leftJoinAndSelect("chan.messages", "messages")
// 			 .leftJoinAndSelect("messages.sender", "sender")
// 			.orderBy("messages.id", "ASC")
// 			.getOne()
// 	}
// 	return msgs;
// }
