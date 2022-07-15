import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { CreateChanDto } from './dtos/createChan.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel) private channelRepository: Repository<Channel>,
	) {}

  /**
   * ------------------------ CREATE CHANNEL  ------------------------- *
   */

	async createNewChan(channel: CreateChanDto) {
		return await this.channelRepository.save({
			title: channel.title,
			owner: channel.owner
		});
	}


  /**
   * ------------------------ JOIN CHANNEL  ------------------------- *
   */

  /**
   * 
   * @param user user who want to join the channel 
   * @param channelName the name of the channel
   * 
   * @todo preciser que si c'est la premiere personne a rejoindre le channel = OWNER ! 
   */
	joinChan(user : User, channelName : string) {
		let channel : Channel;
		try {
			channel = this.getChanByName(channelName);
		}
		catch {
			// user.status = owner;
			// return this.createNewChan(channelName);
		}
	}


	 getChanByName(chanName : string) {
		 let channel;
		// let channel : Channel = this.channelRepository.findOne({where: {name: chanName}});
		// if (!channel)
			// console.log("le channel il existe po");
		return channel;


	}
}


