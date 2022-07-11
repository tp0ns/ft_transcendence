import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatDto } from './CreateChat.dto';
import { Chat } from './entities/chat.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Chat) private chatRepository: Repository<Chat>,
	) {}

	async createNewChat(chat: CreateChatDto) {
		const channelData = { ...chat };
		const newChannel = this.chatRepository.create(channelData);
		return await this.chatRepository.save(newChannel);
	}
}


// const chan: Channel = new Channel();
// 		chan.name = name;
// 		chan.owner = user;
// 		await this.channelsRepo.save(chan);
// 		return await this.userService.joinChannel(user, name);