import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { CreateChanDto } from './dtos/createChan.dto';

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


