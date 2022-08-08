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
	 * @brief Setup d'un nouveau channel : 
	 * - ajout d'un mot de passe si chan protege 
	 * - verification du unique name 
	 * - ajout de l'owner (le createur)
	 * 
	 * @param user le user createur du channel 
	 * @param chan toutes les informations permettant la creation du channel 
	 *
	 */
	async createNewChan(user: UserEntity, chan: CreateChanDto): Promise<ChannelEntity> 
	{
		let newPassword: string = null;
		const date = new Date();
		let channel: ChannelEntity;
		if ((await this.getIfUniqueName(chan.title)) == true) {
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
			this.addMember(user, channel.title);
			this.addAdmin(user, channel.title);
			if (channel.private == false) {
				let users: UserEntity[] = await this.userService.getAllUsers();
				for (const newUser of users) {
					if (user.userId != newUser.userId)
						this.addMember(newUser, channel.title);
				}
			}
		} 
		else 
			console.log(`An another channel have this name`);
		return channel;
	}

	/**
	 * @brief Changement d'un element du channel 
	 * 
	 * @param user le user qui souhaite effectuer la modification
	 * - la plupart du temps : necessaire que ce soit un admin ou le owner
	 * - sauf dans le cas de l'ajout d'un membre dans un channel privee
	 * @param modifications l'interface qui permettra de savoir quel
	 * est l'element du channel a modifier
	 *
	 * @todo peut etre a modifier pour un switch : checker comment ca marche
	 */
	async modifyChannel(user: UserEntity, modifications: ModifyChanDto) 
	{
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
			await this.deleteBanMember(user, modifications);
		if (modifications.deleteMute)
			await this.deleteMuteMember(user, modifications);
	}

	/**
	 * @brief Modification du password 
	 * 
	 * @param user le user qui souhaite effectuer la modification
	 * -> doit etre owner
	 * @param modifications l'interface dans laquelle le password
	 * sera rempli pour modifier celui du channel.
	 *
	 */
	async modifyPassword(user: UserEntity, modifications: ModifyChanDto) 
	{
		const channel: ChannelEntity = await this.getChanByName(
			modifications.title,
		);
		if (!channel || channel.owner.userId != user.userId)
			console.log(`You can't modify the channel`);
		else if (modifications.protected) {
			channel.protected = false;
			channel.password = null;
		} else {
			channel.protected = true;
			channel.password = await bcrypt.hash(modifications.newPassword, 10);
		}
		await this.channelRepository.save(channel);
	}

	/**
	 * @brief Ajout d'un admin
	 * 
	 * @param user le user qui souhaite effectuer la modification
	 * -> doit etre admin 
	 * @param modifications l'interface dans laquelle un username dans admin
	 * sera rempli pour ajouter un admin au channel.
	 *
	 */
	async modifyAdmins(user: UserEntity, modifications: ModifyChanDto) 
	{
		const channel: ChannelEntity = await this.getChanByName(
			modifications.title,
		);
		if (channel.admins.find((admin: UserEntity) => admin.username === user.username))
		{
			let userToAdd: UserEntity = await this.userService.getUserByUsername(
				modifications.newAdmin);
			if (!channel.admins.includes(userToAdd)) {
				await this.addAdmin(userToAdd, modifications.title);
				}
		}
	}

	/**
	 * @brief Ajout d'un membre dans un channel privee 
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
	async modifyMembers(invitingUser: UserEntity, modifications: ModifyChanDto) 
	{
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let user: UserEntity = await this.userService.getUserByUsername(
			modifications.newMember,
		);
		if (
			channel &&
			channel.private == true &&
			channel.members.find((member: UserEntity) => member.username === invitingUser.username)
		) {
			if (!channel.members.includes(user)) {
				await this.addMember(user, modifications.title);
				//rejoindre la room aussi
			}
		}
	}

	/**
	 * @brief Suppression d'un channel 
	 * 
	 * @param user le user qui souhaite supprimer le channel :
	 * -> seulement le owner 
	 * @param chanName le channel a supprimer
	 *
	 * @todo est ce que seul le owner a le droit de supprimer un channel ?
	 */
	async deleteChan(user: UserEntity, chanName: string) 
	{
		const channel: ChannelEntity = await this.getChanByName(chanName);
		if (channel.admins.find((admin: UserEntity) => admin.username === user.username))
		{
			await this.channelRepository
				.createQueryBuilder()
				.delete()
				.from(ChannelEntity)
				.where('title = :chanName', { chanName: channel.title })
				.execute();
		}
	}

	/**
	 * ------------------------ MODIFY MEMBERS LIST  ------------------------- *
	 */

	/**
	 * @brief Ajout d'un membre dans le channel 
	 * -> lors d'un unban 
	 * -> lors de l'ajout d'un membre : dans un chan privee 
	 * -> pour tous les users connectes : dans un chan public
	 * 
	 * @param user le user qui rejoint le channel
	 * @param chanName 
	 *
	 */

	async addMember(user: UserEntity, chanName: string) 
	{
		let channel: ChannelEntity = await this.getChanByName(chanName);
		channel.members = [...channel.members, user];
		await channel.save();
	}

	/**
	 * @brief Ajout d'un admin dans un channel 
	 * 
	 * @param user le user qui rejoint le channel en tant qu'admin 
	 * @param chanName 
	 * 
	 */
	async addAdmin(user: UserEntity, chanName: string) 
	{
		let channel: ChannelEntity = await this.getChanByName(chanName);
		channel.admins = [...channel.admins, user];
		await channel.save();
	}

	/**
	 * @brief Ajout d'un user en tant que membre bannit 
	 * 
	 * @param banningUser le user qui souhaite bannir 
	 * -> doit etre admin
	 * @param userToBan le user a bannit 
	 * -> doit etre membre du channel 
	 * @param chanName
	 *
	 */
	async addBanMembers(banningUser: UserEntity, modifications: ModifyChanDto) 
	{
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let newBan: UserEntity = await this.userService.getUserByUsername(modifications.newBan);
		if (newBan 
			&& channel.members.find((member: UserEntity) => member.username === newBan.username
			 && channel.admins.find((admin: UserEntity) => admin.username === banningUser.username)))
		{
			channel.bannedMembers = [...channel.bannedMembers, newBan];
			await channel.save();
			this.deleteMember(newBan, channel.title);
		}
	}

	/**
	 * @brief Ajout d'un user en tant que membre mute 
	 * 
	 * @param muttingUser le user qui souhaite mute
	 * -> doit etre admin 
	 * @param userToMute le user a mute 
	 * -> doit etre membre du channel 
	 * @param chanName
	 *
	 */
	async addMuteMembers(muttingUser: UserEntity, modifications: ModifyChanDto) 
	{
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let newMute: UserEntity = await this.userService.getUserByUsername(
			modifications.newMute);
		if (newMute 
			&& channel.members.find((member: UserEntity) => member.username === newMute.username
			 && channel.admins.find((admin: UserEntity) => admin.username === muttingUser.username)))
		{
			channel.mutedMembers = [...channel.mutedMembers, newMute];
			await channel.save();
		}
	}

	/**
	 * @brief Suppression d'un user bannit 
	 * -> le rajoute a la liste de membre 
	 * 
	 * @param unbanningUser le user qui souhaite unban
	 * @param userToUnban le user a rajouter a la liste des membres
	 * @param chanName
	 *
	 */
	async deleteBanMember(unbanningUser: UserEntity, modifications: ModifyChanDto) 
	{
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let deleteBan: UserEntity = await this.userService.getUserByUsername(
			modifications.deleteBan);
		if (deleteBan && channel.admins.find((admin: UserEntity) => admin.username === unbanningUser.username))
		{
			channel.bannedMembers = channel.bannedMembers.filter((banned) => {
				return banned.userId !== deleteBan.userId;
			});
			await channel.save();
			this.addMember(deleteBan, channel.title);
		}
	}

	/**
	 * @brief Suppression d'un user mute 
	 * 
	 * @param unmuttingUser le user qui souhaite unmute 
	 * @param userToUnmute le user unmute 
	 * @param chanName
	 *
	 * @todo verifier que le user est deja mute
	 */
	async deleteMuteMember( unmuttingUser: UserEntity, modifications: ModifyChanDto) 
	{
		let channel: ChannelEntity = await this.getChanByName(modifications.title);
		let deleteMute: UserEntity = await this.userService.getUserByUsername(
			modifications.deleteMute);
		if (deleteMute && channel.admins.find((admin: UserEntity) => admin.username === unmuttingUser.username))
		{
			channel.mutedMembers = channel.mutedMembers.filter((mutted) => {
				return mutted.userId !== deleteMute.userId;
			});
			await channel.save();
		}
	}

	/**
	 * @brief Suppression d'un user de la liste de membre d'un channel
	 * - Si le user a ete banni, il est supprime le la liste des membres
	 * 
	 * @param userToDelete le user a supprimer de la liste de membres
	 * @param chanName 
	 */
	async deleteMember( userToDelete: UserEntity, chanName: string )
	{
		let channel : ChannelEntity = await this.getChanByName(chanName);
		channel.members = channel.members.filter((member) => {
			return member.userId !== userToDelete.userId;
		});
		await channel.save();
	}

	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */

	/**
	 * @brief Pouvoir recuperer tous les channels existants 
	 * 
	 */
	async getAllChannels(): Promise<ChannelEntity[]> 
	{
		const channels: ChannelEntity[] = await this.channelRepository.find({
			relations: [
				'members',
				'admins',
				'owner',
				'bannedMembers',
				'mutedMembers',
			],
		});
		return channels;
	}

	/**
	 * @brief Permet de recuperer seulement les channels du user 
	 * Autant privees que publiques
	 *
	 * @todo est-ce que j'envoie aussi si le user est mute ou ban ?
	 */
	async getMemberChannels(member: UserEntity): Promise<ChannelEntity[]> 
	{
		let channels: ChannelEntity[] = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.members', 'members')
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
			.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
			.leftJoinAndSelect('channel.admins', 'admins')
			.where('channel.private = false')
			.orWhere('members.userId = :id', { id: member.userId })
			.getMany();
		return channels;
	}

	/**
	 * @brief Retrouver un channel avec son nom
	 *
	 */
	async getChanByName(chanName: string): Promise<ChannelEntity> 
	{
		let channel: ChannelEntity = await this.channelRepository.findOne({
			where: { title: chanName },
			relations: [
				'members',
				'admins',
				'owner',
				'bannedMembers',
				'mutedMembers',
			],
		});
		if (!channel)
			return null;
		return channel;
	}

	/**
	 * @brief Permet de n'avoir pas 2 channel du meme nom.
	 * 
	 * @param chanName 
	 */
	async getIfUniqueName(chanName: string): Promise<boolean> 
	{
		let channels: ChannelEntity[] = await this.getAllChannels();
		for (let channel of channels) {
			if (channel.title == chanName) return false;
		}
		return true;
	}

	/**
	 * ------------------------ MESSAGES  ------------------------- *
	 */

	/**
	 * @brief Stocke le message envoyer dans le DB
	 * 
	 * @param user le user qui envoie le message 
	 * @param payload un tableau avec les informations du messages envoye 
	 * - payload[0] : message (string)
	 * - payload[1] : le nom du channel (string)
	 */
	async sendMessage(user: UserEntity, payload: string)
	{
		let channel: ChannelEntity = await this.getChanByName(payload[1]);
		this.messageService.addNewMessage(user, channel, payload[0]);
	}
}
