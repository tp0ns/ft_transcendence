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
import { channel } from 'diagnostics_channel';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity)
		private channelRepository: Repository<ChannelEntity>,
		@Inject(forwardRef(() => MessageService))
		private messageService: MessageService,
		@Inject(forwardRef(() => UserService)) private userService: UserService,
	) {}

	/**
	 * ------------------------ CREATE/MODIFY/DELETE CHANNEL  ------------------------- *
	 */
	
	/**
	 * 
	 * @param user 
	 * @param chan 
	 * 
	 * @todo verifier qu'un autre channel ne porte pas deja le meme nom
	 */
	async createNewChan(user: UserEntity, chan: CreateChanDto) : Promise<ChannelEntity> {
		let newPassword: string = null;
		const date = new Date();
		let channel: ChannelEntity;
		if (await this.getIfUniqueName(chan.title) == true)
		{
			if (chan.password != '') 
				newPassword = await bcrypt.hash(chan.password, 10);
			channel = await this.channelRepository.save({
				title: chan.title,
				owner: user,
				password: newPassword,
				private: chan.private,
				protected: chan.protected,
				creation: date,
				update: date,
			});
			this.joinChan(user, channel.title)
			this.joinAdmin(user, channel.title);
			if (channel.private == false) {
				let users: UserEntity[] = await this.userService.getAllUsers();
				for (const newUser of users)
				{
					if (user.userId != newUser.userId)
						this.joinChan(newUser, channel.title);
				}
			}
		}
		else 
			console.log(`An another channel have this name`);
		return channel;
	}

	/**
	 *
	 * @param user le user qui souhaite effectuer la modification
	 * - la plupart du temps : necessaire que ce soit un admin ou le owner
	 * - sauf dans le cas de l'ajout d'un membre dans un channel privee
	 * @param modifications l'interface qui permettra de savoir quel
	 * est l'element du channel a modifier
	 *
	 * @todo peut etre a modifier pour un switch : checker comment ca marche
	 */
	async modifyChannel(user: UserEntity, modifications: ModifyChanDto) {
		console.log(`check modifications :`, JSON.stringify(modifications));
		if (modifications.newPassword || modifications.protected)
			await this.modifyPassword(user, modifications);
		if (modifications.newAdmin) 
			await this.modifyAdmins(user, modifications);
		if (modifications.newMember) 
			await this.modifyMembers(user, modifications);
		if (modifications.newBan) 
			await this.addBanMembers(user, modifications);
		if (modifications.newMute) 
			await this.addMuteMembers(user, modifications);
		if (modifications.deleteBan)
			await this.deleteBanMembers(user, modifications);
		if (modifications.deleteMute)
			await this.deleteMuteMembers(user, modifications);
	}

	/**
	 *
	 * @param user le user qui souhaite effectuer la modification
	 * -> doit etre owner
	 * @param modifications l'interface dans laquelle le password
	 * sera rempli pour modifier le password du channel.
	 *
	 */
	async modifyPassword(user: UserEntity, modifications: ModifyChanDto) {
		const channel: ChannelEntity = await this.getChanByName(
			modifications.title,
		);
		if (!channel || channel.owner.userId != user.userId)
			console.log(`You can't modify the channel`);
		else if (modifications.protected) 
		{
			channel.protected = false;
			channel.password = null;
		}
		else 
		{
			channel.protected = true;
			channel.password = await bcrypt.hash(modifications.newPassword, 10);
		}
		await this.channelRepository.save(channel);

	}

	/**
	 *
	 * @param user le user qui souhaite effectuer la modification
	 * -> doit etre admin ou owner
	 * @param modifications l'interface dans laquelle un username dans admin
	 * sera rempli pour ajouter un admin au channel.
	 * 
	 * @todo verifier que le user qui veut ajouter un autre user en admin 
	 * est lui meme un admin (includes marche pas j'ai l'impression)
	 */
	async modifyAdmins(user: UserEntity, modifications: ModifyChanDto) {
		const channel: ChannelEntity = await this.getChanByName(
			modifications.title,
		);
		let userToAdd: UserEntity = await this.userService.getUserByUsername(
			modifications.newAdmin);
		if (!channel.admins.includes(userToAdd)) {
			await this.joinAdmin(userToAdd, modifications.title);
		}
	}

	/**
	 *
	 * @param invitingUser le user qui souhaite effectuer la modification
	 * -> peut etre un simple membre
	 * @param modifications l'interface dans laquelle :
	 * - un username dans member sera rempli pour ajouter un member au channel
	 * s'il n'est pas deja dans le channel, s'il n'est pas ban
	 * - le titre d'un channel sera rempli pour verifier qu'il s'agit d'un
	 * channel privee
	 *
	 *
	 * ❓ - est ce que si y'a une invitation mais un password il faut rentrer
	 * le password pour pouvoir rejoindre le channel ? c chiant a fair
	 */
	async modifyMembers(invitingUser: UserEntity, modifications: ModifyChanDto) {
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let user: UserEntity = await this.userService.getUserByUsername(modifications.newMember);
		if (channel && channel.private == true && (this.getIfUserInChan(invitingUser, channel)))
		{
			if (!channel.members.includes(user)) 
			{
				await this.joinChan(user, modifications.title);
				//rejoindre la room aussi
			}
		}
	}

	/**
	 *
	 * @param user le user qui souhaite supprimer le channel :
	 * -> seulement le owner ??
	 * @param chanName le channel a supprimer
	 * 
	 * @todo est ce que seul le owner a le droit de supprimer un channel ? 
	 */
	async deleteChan(user: UserEntity, chanName: string) {
		const channel: ChannelEntity = await this.getChanByName(chanName);
			await this.channelRepository
				.createQueryBuilder()
				.delete()
				.from(ChannelEntity)
				.where('title = :chanName', { chanName: channel.title })
				.execute();
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

	async joinAdmin(user: UserEntity, channelName: string) {
		let channel: ChannelEntity = await this.getChanByName(channelName);
		channel.admins = [...channel.admins, user];
		await channel.save();
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

	/**
	 *
	 * @param banningUser
	 * @param userToBan
	 * @param chanName
	 *
	 * @todo verifier que le user est bien dans le channel (vrmt ?, on peut pas bannir en avance?)
	 * @todo verifier que le user n'est pas deja ban
	 * @todo mettre le user dans bannedMembers EEEEEEET le supprimer de toutes les autres listes (admins, members, etc... )
	 *
	 */
	async addBanMembers(banningUser: UserEntity, modifications: ModifyChanDto) {
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let newBan: UserEntity = await this.userService.getUserByUsername(
			modifications.newBan,
		);
		channel.bannedMembers = [...channel.bannedMembers, newBan];
		await channel.save();
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
	async addMuteMembers(muttingUser: UserEntity, modifications: ModifyChanDto) {
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let newMute: UserEntity = await this.userService.getUserByUsername(
			modifications.newMute,
		);
		channel.mutedMembers = [...channel.mutedMembers, newMute];
		await channel.save();
	}

	/**
	 *
	 * @param unbanningUser
	 * @param userToUnban
	 * @param chanName
	 *
	 * @todo verifier que le user est bien banni
	 */
	async deleteBanMembers(
		unbanningUser: UserEntity,
		modifications: ModifyChanDto,
	) {
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let deleteBan: UserEntity = await this.userService.getUserByUsername(
			modifications.deleteBan,
		);
			channel.bannedMembers = channel.bannedMembers.filter((banned) => {
				return banned.userId !== deleteBan.userId
			})
			await channel.save();
	}

	/**
	 *
	 * @param unmuttingUser
	 * @param userToUnmute
	 * @param chanName
	 *
	 * @todo verifier que le user est deja mute
	 */
	async deleteMuteMembers(
		unmuttingUser: UserEntity,
		modifications: ModifyChanDto,
	) {
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let deleteMute: UserEntity = await this.userService.getUserByUsername(
			modifications.deleteMute,
		);
		channel.mutedMembers = channel.mutedMembers.filter((mutted) => {
			return mutted.userId !== deleteMute.userId
		})
		await channel.save();
	}

	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */

	async getAllChannels(): Promise<ChannelEntity[]> {
		const channels: ChannelEntity[] = await this.channelRepository.find({ relations: 
				['members', 'admins', 'owner', 'bannedMembers', 'mutedMembers']});
		return channels;
	}

	/**
	 *
	 * @param member
	 * @returns all member's channels
	 *
	 * @todo est-ce que j'envoie aussi si le user est mute ou ban ?
	 */
	async getMemberChannels(member: UserEntity): Promise<ChannelEntity[]> {
		let channels: ChannelEntity[] = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.members', 'members')
			.where('channel.private = false')
			.orWhere('members.userId = :id', { id: member.userId })
			.getMany();
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
	async getChanByName(chanName: string): Promise<ChannelEntity> {
		let channel: ChannelEntity = await this.channelRepository.findOne({
			where: { title: chanName },
			relations: ['members', 'admins', 'owner', 'bannedMembers', 'mutedMembers'],
		});
		// if (!channel)
		// console.log("le channel il existe po");
		return channel;
	}

	async getIfUserInChan(userToFind: UserEntity, channel: ChannelEntity) : Promise<boolean>
	{
		for (const member of channel.members)
		{
			if (member.userId === userToFind.userId)
				return true;
		}
		return false;
	}

	async getIfUniqueName(chanName: string) : Promise<boolean>
	{
		let channels: ChannelEntity[] = await this.getAllChannels();
		for (let channel of channels) {
			if (channel.title == chanName)
				return false;
		}
		return true;
	}

	/**
	 * ------------------------ MESSAGES  ------------------------- *
	 */

	async sendMessage(user: UserEntity, payload: string) {
		let channel: ChannelEntity = await this.getChanByName(payload[1]);
		this.messageService.addNewMessage(user, channel, payload[0]);
	}
}
