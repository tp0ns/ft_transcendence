import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { DataSource, Repository } from 'typeorm';
import { MessageService } from '../messages/messages.service';
import { ChannelEntity } from './channel.entity';
import * as bcrypt from 'bcrypt';
import { CreateChanDto } from './dtos/createChan.dto';
import { UserService } from 'src/user/user.service';
import { ModifyChanDto } from './dtos/modifyChan.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity) private channelRepository: Repository<ChannelEntity>,
		@Inject(forwardRef(() => MessageService)) private messageService: MessageService,
		@Inject(forwardRef(() => UserService)) private userService: UserService,
	) {}

	/**
	 * ------------------------ CREATE/MODIFY/DELETE CHANNEL  ------------------------- *
	 */

	/**
	 * 
	 * @todo faire en sorte que lors de la creation d'un nouveau chan, il s'affiche
	 * pour tout le monde dans les channels publics si chan public
	 * @todo verifier qu'un autre channel ne porte pas deja le meme nom
	 */
	async createNewChan(user: UserEntity, chan: CreateChanDto) {
		let newPassword : string = null;
		const date = new Date();
		let channel : ChannelEntity;
		if (chan.password != '')
			newPassword = await bcrypt.hash(chan.password, 10);
		try {
			channel = await this.channelRepository.save({
				title: chan.title,
				owner: user,
				password: newPassword,
				private: chan.private,
				protected: chan.protected,
				creation: date, 
				update: date,
					});
				}
		catch {
			// error
			}
		this.joinChan(user, channel.title)
		if (channel.private == false)
		{
			//tant qu'on a pas parcouru toute la liste des users connectes
			//faire un joinChannel
		}
	}

	async modifyChannel(user: UserEntity, modifications: ModifyChanDto)
	{
		if (modifications.password)
			this.modifyPassword(user, modifications);
		if (modifications.admin)
			this.modifyAdmins
	}

	/**
	 * 
	 * @param user 
	 * @param chanName 
	 * @param newPassword 
	 * 
	 * @todo hash le nouveau password avant de le save dans le channel
	 */
	async modifyPassword(user: UserEntity, modifications: ModifyChanDto)
	{
		const channel : ChannelEntity = await this.getChanByName(modifications.title);
		if (channel.owner.userId != user.userId || channel.protected == false)
			console.log(`You can't modify the channel`);
		else 
		{
			channel.password = modifications.password;
			await this.channelRepository.save(channel);
		}
	}

	async modifyAdmins(user: UserEntity, modifications: ModifyChanDto)
	{
		const channel: ChannelEntity = await this.getChanByName(modifications.title);
		if (channel.owner.userId != user.userId)
			console.log(`You can't set new admins`);
		else 
		{
			let user: UserEntity = await this.userService.getUserByUsername(modifications.admin)
			if (!channel.admins.includes(user))
			{
				channel.admins = [...channel.admins, user];
				await channel.save();
			}
		}
	}

	/**
	 * 
	 * - verifier si le channel est bien privee, sinon, tous membres connectes 
	 * est deja membre automatiquement du channel
	 * - pas besoin de verifier si la personne qui souhaite ajouter des membres
	 * est owner ou admins car tout le monde peut le faire 
	 * - verifier que le user n'est pas deja dans le channel 
	 * ❓ - verifier que le user n'est pas ban ? 
	 * ❓ - est ce que si y'a une invitation mais un password il faut rentrer 
	 * le password pour pouvoir rejoindre le channel ? c chiant a fair
	 * 
	 * @param invitingUser 
	 * @param chanName 
	 * @param usersToAdd 
	 */
	async modifyMembers(invitingUser: UserEntity, modifications: ModifyChanDto)
	{
		let channel : ChannelEntity = await this.getChanByName(modifications.title);
		if (channel && channel.private == true)
		{
			let user: UserEntity = await this.userService.getUserByUsername(modifications.member)
			if (!channel.members.includes(user))
				await this.joinChan(user, modifications.title);
		}
	}

	async deleteChan(user: UserEntity, chanName: string) 
	{
		const channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.owner != user)
			console.log(`You can't delete this channel`);
		else 
		{
			await this.channelRepository
				.createQueryBuilder()
				.delete()
				.from(ChannelEntity)
				.where("title = :chanName", { chanName: channel.title })
				.execute()
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
		channel.members = [...channel.members, user];
		await channel.save();
		//find si le user est deja dans le channel 
		//check si le user n'est pas ban 
		//check si le channel existe
		//verifier que le 
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

	/**
	 * ------------------------ BAN / MUTE  ------------------------- *
	 */

	/**
	 * 
	 * @param banningUser 
	 * @param userToBan 
	 * @param chanName 
	 * 
	 * @todo verifier que le user est bien dans le channel (vrmt ?, on peut pas bannir en avance?)
	 * @todo verifier que le user n'est pas deja ban 
	 * 
	 */
	async banUser(banningUser: UserEntity, userToBan: UserEntity, chanName: string)
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.admins.includes(banningUser) || channel.owner == banningUser)
		{
			channel.members = [...channel.bannedMembers, userToBan];
			await channel.save();
		}
		else 
		{
			console.log(`You need to be an admin to ban someone`);
		}
	}

	/**
	 * 
	 * @param muttingUser 
	 * @param userToMute 
	 * @param chanName 
	 * 
	 * @todo verifier que le user est bien dans le channel
	 * @todo verifier que le user n'est pas deja mute 
	 */
	async muteUser(muttingUser: UserEntity, userToMute: UserEntity, chanName: string)
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.admins.includes(muttingUser) || channel.owner == muttingUser)
		{
			channel.members = [...channel.mutedMembers, userToMute];
			await channel.save();
		}
	}

	/**
	 * 
	 * @param unbanningUser 
	 * @param userToUnban 
	 * @param chanName 
	 * 
	 * @todo verifier que le user est bien banni
	 */
	async unbanUser(unbanningUser: UserEntity, userToUnban: UserEntity, chanName: string)
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.admins.includes(unbanningUser) || channel.owner == unbanningUser)
		{
			await this.channelRepository
				.createQueryBuilder()
				.relation(ChannelEntity, 'bannedMembers')
				.of(UserEntity)
				.remove(userToUnban)
		}
	}

	/**
	 * 
	 * @param unmuttingUser 
	 * @param userToUnmute 
	 * @param chanName 
	 * 
	 * @todo verifier que le user est deja mute
	 */
	async unmuteUser(unmuttingUser: UserEntity, userToUnmute: UserEntity, chanName: string)
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		if (channel.admins.includes(unmuttingUser) || channel.owner == unmuttingUser)
		{
		await this.channelRepository
			.createQueryBuilder()
			.relation(ChannelEntity, 'mutedMembers')
			.of(UserEntity)
			.remove(userToUnmute)
		}
	}



	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */

	async getAllChannels(): Promise<ChannelEntity[]> 
	{
		const channels: ChannelEntity[] = await this.channelRepository.find();
		return channels;
	}

	/**
	 * 
	 * @param member 
	 * @returns all member's channels 
	 * 
	 * @todo est-ce que j'envoie aussi si le user est mute ou ban ?
	 */
	async getMemberChannels(member: UserEntity): Promise<ChannelEntity[]>
	{
		let channels : ChannelEntity[] = await this.channelRepository
				.createQueryBuilder('channel')
				.leftJoinAndSelect("channel.members", "members")
				.where('channel.private = false')
				.andWhere("members.userId = :id", {id: member.userId})
				.getMany()
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
	async getChanByName(chanName : string) : Promise<ChannelEntity> 
	{
		let channel : ChannelEntity = await this.channelRepository.findOne({where: { title: chanName }, relations: ['members', 'owner', 'admins']});
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

