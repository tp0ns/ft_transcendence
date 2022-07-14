import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChanDto } from './CreateChan.dto';
import { Channel } from './channel.entity';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
	) {}

	async createNewChan(channel: CreateChanDto) {
		return await this.channelRepository.save({
			title: channel.title,
			owner: channel.owner
		});
	}
}


