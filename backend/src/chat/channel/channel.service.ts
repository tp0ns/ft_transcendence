import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { DataSource, Repository } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { CreateChanDto } from './dtos/createChan.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity) private channelRepository: Repository<ChannelEntity>,
	) {}

	/**
	 * ------------------------ CREATE CHANNEL  ------------------------- *
	 */

	async createNewChan(user: UserEntity, channel: ChannelEntity) {
		try {
		await this.channelRepository.save({
			title: channel.title,
			owner: user,
			password: channel.password,
			isProtected : channel.isProtected,
		});
		}
		catch {
			//error
		}
	}

  /**
   * ------------------------ CIRCULATION IN CHAN  ------------------------- *
   */

  /**
   * 
   * @param user user who want to join the channel 
   * @param channelName the name of the channel
   *
   * @todo si la personne est deja dans le channel : quel comportement ? 
   */

	async joinChan(user : UserEntity, channelName : string) {
		let channel : ChannelEntity = await this.getChanByName(channelName);

		// let channel : Channel = await this.channelRepository.findOne({where: { title: channelName }, relations: ['members']})
		//find si le user est deja dans le channel 
		channel.members = [...channel.members, user];
		await channel.save();
	}
/**
 * 
 * @param user 
 * @param channelName 
 * 
 * @todo si c'est l'owner qui leave le chan : quel comportement ? 
 */
	async leaveChan(user : UserEntity, channelName : string ) { 
		let channel : ChannelEntity = await this.getChanByName(channelName);

		console.log(`members of chans : `, JSON.stringify(channel.members));
		console.log(`user who want to quit : `, JSON.stringify(user.username));
		console.log(`channel to quit : `, JSON.stringify(channelName));
		await this.channelRepository
			.createQueryBuilder()
			.relation(ChannelEntity, 'members')
			.of(user)
			.remove(user)
	}
	
	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */
	
	async getAllChannels(): Promise<ChannelEntity[]> {
		const channels : ChannelEntity[] = await this.channelRepository.find()
		return channels;
	}

	/**
	 * @brief Find the channel to join with his name
	 *
	 * @param chanName
	 * @returns Channel object corresponding
	 *
	 * @todo faire un try/catch ?
	 */
	public async getChanByName(chanName : string) : Promise<ChannelEntity> 
	{
		let channel : ChannelEntity = await this.channelRepository.findOne({where: { title: chanName }, relations: ['members']})
		if (!channel)
			console.log("le channel il existe po");
		return channel;
	}
}
