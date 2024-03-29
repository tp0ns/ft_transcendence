import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

	/**
	 *
	 * @param sender
	 * @param chan
	 * @param msg
	 * @returns
	 *
	 */
	async addNewMessage(
		sender: UserEntity,
		chan: ChannelEntity,
		msg: string,
	): Promise<MessagesEntity> {
		const message: MessagesEntity = await this.MessageRepository.save({
			channel: chan,
			user: sender,
			message: msg,
		});
		return message;
	}

	async getChannelMessages(
		user: UserEntity,
		channelId: string,
	): Promise<MessagesEntity[]> {
		let channel: ChannelEntity = await this.channelService.getChanById(
			channelId,
		);
		let msgs: MessagesEntity[];
		if (channel) {
			if (channel.bannedMembers && channel.bannedId.includes(user.userId))
				return null;
			let blockedRelations: string[] =
				await this.relationsService.getBlockedRelations(user);
				if (blockedRelations.length > 0 && blockedRelations.includes(user.userId)) {
					blockedRelations = blockedRelations.filter((me) => {
						return me !== user.userId;
					});
				msgs = await this.MessageRepository.createQueryBuilder('messages')
					.leftJoinAndSelect('messages.user', 'sender')
					.leftJoinAndSelect('messages.channel', 'channel')
					.where('channel.channelId = :id', { id: channel.channelId })
					.andWhere('sender.userId NOT IN (:...blocked)', {
						blocked: blockedRelations,
					})
					.getMany();
			} else {
				msgs = await this.MessageRepository.createQueryBuilder('messages')
					.leftJoinAndSelect('messages.user', 'sender')
					.leftJoinAndSelect('messages.channel', 'channel')
					.where('channel.channelId = :id', { id: channel.channelId })
					.getMany();
			}
		}
		return msgs;
	}
}
