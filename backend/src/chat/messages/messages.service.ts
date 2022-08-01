import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import UserEntity from "src/user/models/user.entity";
import { Repository } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";
import { MessagesEntity } from './messages.entity';

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(MessagesEntity) private MessagesRepository: Repository<MessagesEntity>,
	) {}


	/**
	 * ------------------------ ADD NEW MESSAGES  ------------------------- *
	 */

	 async addNewMessage(sender: UserEntity, chan: ChannelEntity, msg: string) : Promise<MessagesEntity> {
		let message: MessagesEntity = await this.MessagesRepository.save({
			channel : chan, 
			user: sender,
			message: msg,
		})
		return message;
	}
}