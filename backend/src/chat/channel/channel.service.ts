import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { DataSource, Repository } from 'typeorm';
import { MessageService } from '../messages/messages.service';
import { ChannelEntity } from './channel.entity';
import * as bcrypt from 'bcrypt';
import { CreateChanDto } from './dtos/createChan.dto';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity)
		private channelRepository: Repository<ChannelEntity>,
		@Inject(forwardRef(() => MessageService))
		private messageService: MessageService,
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
		let newPassword: string = null;
		const date = new Date();
		let channel: ChannelEntity;
		if (chan.password != '') newPassword = await bcrypt.hash(chan.password, 10);
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
		} catch {
			// error
		}
		this.joinChan(user, channel.title);
		if (channel.private == false) {
			//tant qu'on a pas parcouru toute la liste des users connectes
			//faire un joinChannel
		}
	}

	/**
	 *
	 * @param user
	 * @param chanName
	 * @param newPassword
	 *
	 * @todo hash le nouveau password avant de le save dans le channel
	 */
	async modifyPassword(
		user: UserEntity,
		chanName: string,
		newPassword: string,
	) {
		const channel: ChannelEntity = await this.getChanByName(chanName);
		if (channel.owner != user || channel.protected == false)
			console.log(`You can't modify the channel`);
		else {
			channel.password = newPassword;
			await this.channelRepository.save(channel);
		}
	}

	async modifyAdmins(
		user: UserEntity,
		chanName: string,
		newAdmins: UserEntity[],
	) {
		const channel: ChannelEntity = await this.getChanByName(chanName);
		//verifier owner & admins
		if (channel.owner != user) console.log(`You can't set new admins`);
		else {
			//ajouter tableau d'admins dans channelEntity
		}
	}

	async modifyMembers(
		invitingUser: UserEntity,
		chanName: string,
		usersToAdd: UserEntity[],
	) {
		let channel: ChannelEntity = await this.getChanByName(chanName);
		// if (channel.private == true)
		// await this.joinChan(userToInvite, chanName);
	}

	async deleteChan(user: UserEntity, chanName: string) {
		const channel: ChannelEntity = await this.getChanByName(chanName);
		if (channel.owner != user) console.log(`You can't delete this channel`);
		else {
			await this.channelRepository
				.createQueryBuilder()
				.delete()
				.from(ChannelEntity)
				.where('title = :chanName', { chanName: channel.title })
				.execute();
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

	async joinChan(user: UserEntity, channelName: string) {
		let channel: ChannelEntity = await this.getChanByName(channelName);
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
	async leaveChan(user: UserEntity, channelName: string) {
		let channel: ChannelEntity = await this.getChanByName(channelName);
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

	async banUser(
		banningUser: UserEntity,
		userToBan: UserEntity,
		chanName: string,
	) {
		let channel: ChannelEntity = await this.getChanByName(chanName);
		channel.members = [...channel.bannedMembers, banningUser];
		await channel.save();
	}

	async muteUser(
		muttingUser: UserEntity,
		userToMute: UserEntity,
		chanName: string,
	) {
		let channel: ChannelEntity = await this.getChanByName(chanName);
		channel.members = [...channel.mutedMembers, muttingUser];
		await channel.save();
	}

	async unbanUser(
		unbanningUser: UserEntity,
		userToUnban: UserEntity,
		chanName: string,
	) {
		let channel: ChannelEntity = await this.getChanByName(chanName);

		await this.channelRepository
			.createQueryBuilder()
			.relation(ChannelEntity, 'bannedMembers')
			.of(UserEntity)
			.remove(userToUnban);
	}

	async unmuteUser(
		unmuttingUser: UserEntity,
		userToUnmute: UserEntity,
		chanName: string,
	) {
		let channel: ChannelEntity = await this.getChanByName(chanName);

		await this.channelRepository
			.createQueryBuilder()
			.relation(ChannelEntity, 'mutedMembers')
			.of(UserEntity)
			.remove(userToUnmute);
	}

	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */

	async getAllChannels(): Promise<ChannelEntity[]> {
		const channels: ChannelEntity[] = await this.channelRepository.find();
		return channels;
	}

	async getMemberChannels(user: UserEntity): Promise<ChannelEntity[]>
	{
		let channels : ChannelEntity[];
		// const member: MembersEntity = await this.membersService.getMember(user);
		return channels;
	}

	// async getAllPublicChannels() : Promise<ChannelEntity[]>
	// {
	// 	const publicChannels : ChannelEntity[] = await this.channelRepository.find({where: {private: false}})
	// 	return publicChannels;
	// }

	// async getAllPrivateChannels(user: UserEntity) : Promise<ChannelEntity[]>
	// {
	// 	// const member: MembersEntity = await this.membersService.getMember(user);
	// 	const privateChannels : ChannelEntity[] = await this.channelRepository.find({where: {private: true}})

	// 	return privateChannels;
	// }

	/**
	 * @brief Find the channel to join with his name
	 *
	 * @param chanName
	 * @returns Channel object corresponding
	 *
	 * @todo faire un try/catch ?
	 */
	async getChanByName(chanName: string): Promise<ChannelEntity> {
		let channel: ChannelEntity = await this.channelRepository.findOne({
			where: { title: chanName },
			relations: ['members'],
		});
		// if (!channel)
		// console.log("le channel il existe po");
		return channel;
	}

	/**
	 * ------------------------ MESSAGES  ------------------------- *
	 */

	async sendMessage(user: UserEntity, message: string, chanName: string) {
		let channel: ChannelEntity = await this.getChanByName(chanName);
		this.messageService.addNewMessage(user, channel, message);
	}
}
