import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { DataSource, Repository } from 'typeorm';
import { MembersEntity } from '../channelMembers/members.entity';
import { membersService } from '../channelMembers/members.service';
import { ChannelEntity } from './channel.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity) private channelRepository: Repository<ChannelEntity>,
		@Inject(forwardRef(() => membersService))
		private membersService: membersService,
	) {}

	/**
	 * ------------------------ CREATE CHANNEL  ------------------------- *
	 */

	async createNewChan(user: UserEntity, channel: ChannelEntity) {
		// let newPassword = await bcrypt.hash(channel.password, 10);
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

	createMember(user : UserEntity, channel : ChannelEntity) {
		this.membersService.createNewMember(user, channel);
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
		let member : MembersEntity = await this.membersService.createNewMember(user, channel);
		//find si le user est deja dans le channel 
		//check si le user n'est pas ban 
		//check si le channel existe

		channel.members = [...channel.members , member];
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

