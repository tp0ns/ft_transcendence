import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { DataSource, Repository } from 'typeorm';
import { MembersEntity } from '../members/members.entity';
import { membersService } from '../members/members.service';
import { MessageService } from '../messages/messages.service';
import { ChannelEntity } from './channel.entity';
// import * as bcrypt from 'bcrypt';
import { CreateChanDto } from './dtos/createChan.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity) private channelRepository: Repository<ChannelEntity>,
		@Inject(forwardRef(() => membersService)) private membersService: membersService,
		@Inject(forwardRef(() => MessageService)) private messageService: MessageService,
	) {}

	/**
	 * ------------------------ CREATE/ MODIFY CHANNEL  ------------------------- *
	 */

	async createNewChan(user: UserEntity, chan: CreateChanDto) {
		// let newPassword = await bcrypt.hash(chan.password, 10);
		// try {
		const date = new Date();
		let channel : ChannelEntity = await this.channelRepository.save({
			title: chan.title,
			owner: user,
			password: chan.password,
			creation: date, 
			update: date
			// isProtected : channel.isProtected,
		// });
		// }
		// catch {
			//error
		});
	}

	/**
	 * 
	 * @param user 
	 * @param chanName 
	 * @param newPassword 
	 * 
	 * @todo hash le nouveau password avant de le save dans le channel
	 */
	async modifyPassword(user: UserEntity, chanName: string, newPassword : string)
	{
		const channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.owner != user || channel.isProtected == false)
			console.log(`You can't modify the channel`);
		else 
		{
			channel.password = newPassword;
			await this.channelRepository.save(channel);
		}
	}

	async modifyAdmins(user: UserEntity, chanName: string, newAdmins: UserEntity[])
	{
		const channel: ChannelEntity = await this.getChanByName(chanName);
		if (channel.owner != user)
			console.log(`You can't set new admins`);
		else 
		{
			//ajouter tableau d'admins dans channelEntity
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
		await this.membersService.createNewMember(user, channel);
		//find si le user est deja dans le channel 
		//check si le user n'est pas ban 
		//check si le channel existe
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
		console.log(`user who want to quit : `, JSON.stringify(user.username));
		console.log(`channel to quit : `, JSON.stringify(channelName));
		await this.channelRepository
			.createQueryBuilder()
			.relation(ChannelEntity, 'members')
			.of(user)
			.remove(user);
	}

	async invitInChan(invitingUser: UserEntity, userToInvite: UserEntity, chanName: string) : Promise<boolean>
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.isPrivate == true)
		{
			await this.joinChan(userToInvite, chanName);
			return true;
		}
		console.log(`this channel is public, you can't send an invitation`)
		return false;
  }

	/**
	 * ------------------------ BAN / MUTE  ------------------------- *
	 */

	async banUser(banningUser: UserEntity, userToBan: UserEntity, chanName: string)
	{
				
		
	}

	async muteUser(muttingUser: UserEntity, userToMute: UserEntity, chanName: string)
	{
				
		
	}

	async unbanUser(unbanningUser: UserEntity, userToUnban: UserEntity, chanName: string)
	{
				
		
	}

	async unmuteUser(unmuttingUser: UserEntity, userToUnmute: UserEntity, chanName: string)
	{
				
		
	}



	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */

	async getAllChannels(): Promise<ChannelEntity[]> 
	{
		const channels: ChannelEntity[] = await this.channelRepository.find();
		return channels;
	}

	async getAllPublicChannels() : Promise<ChannelEntity[]> 
	{
		const publicChannels : ChannelEntity[] = await this.channelRepository.find({where: {isPrivate: false}})
		return publicChannels;
	}

	async getAllPrivateChannels() : Promise<ChannelEntity[]> 
	{
		const privateChannels : ChannelEntity[] = await this.channelRepository.find({where: {isPrivate: true}})
		return privateChannels;
	}

	/**
	 * @brief Find the channel to join with his name
	 *
	 * @param chanName
	 * @returns Channel object corresponding
	 *
	 * @todo faire un try/catch ?
	 */
	async getChanByName(chanName : string) : Promise<ChannelEntity> 
	{
		let channel : ChannelEntity = await this.channelRepository.findOne({where: { title: chanName }});
		// if (!channel)
			// console.log("le channel il existe po");
		return channel;
	}

	/**
	 * ------------------------ MESSAGES  ------------------------- *
	 */

	async sendMessage(user: UserEntity, message: string, chanName: string)
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		this.messageService.addNewMessage(user, channel, message);
	}


}

