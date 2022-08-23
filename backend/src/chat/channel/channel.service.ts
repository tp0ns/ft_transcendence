import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { Repository } from 'typeorm';
import { MessageService } from '../messages/messages.service';
import { ChannelEntity } from './channel.entity';
import * as bcrypt from 'bcrypt';
import { CreateChanDto } from './dtos/createChan.dto';
import { UserService } from 'src/user/user.service';
import { ModifyChanDto } from './dtos/modifyChan.dto';
import { JoinChanDto } from './dtos/joinChan.dto';
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
	 * @brief Setup d'un nouveau channel :
	 * - ajout d'un mot de passe si chan protege
	 * - verification du unique name
	 * - ajout de l'owner (le createur)
	 *
	 * @param user le user createur du channel
	 * @param chan toutes les informations permettant la creation du channel
	 *
	 */
	async createNewChan(
		user: UserEntity,
		chan: CreateChanDto,
	): Promise<ChannelEntity> {
		console.log(`check dto : `, chan);
		let channel: ChannelEntity;
		if (await this.getIfUniqueName(chan.title))
			channel = await this.saveNewChan(user, chan);
		else console.log(`An another channel have already this name`);
		return channel;
	}

	async saveNewChan(
		user: UserEntity,
		chan: CreateChanDto,
	): Promise<ChannelEntity> {
		const date = Date.now();
		// let newPassword: string = null;
		let channel: ChannelEntity;
		if (chan.DM) return this.saveNewDM(user, chan);
		// if (chan.password != '')
		// 	newPassword = await bcrypt.hash(chan.password, 10);
		const newPassword =
			chan.password != '' ? bcrypt.hashSync(chan.password, 10) : null;
		channel = await this.channelRepository.save({
			title: chan.title,
			owner: user,
			password: newPassword,
			private: chan.private,
			protected: chan.protected,
			creation: date,
			DM: chan.DM,
		});
		await this.addMember(user, channel.title);
		await this.addAdmin(user, channel.title);
		if (!channel.private) {
			let users: UserEntity[] = await this.userService.getAllUsers();
			for (const newUser of users) {
				if (user.userId != newUser.userId)
					await this.addMember(newUser, channel.title);
			}
		}
		return channel;
	}

	async saveNewDM(user: UserEntity, chan: CreateChanDto) {
		const date = Date.now();
		let user2: UserEntity = await this.userService.getUserByUsername(
			chan.user2,
		);
		let dm: ChannelEntity = await this.channelRepository.save({
			title: user.username + '+' + user2.username,
			DM: chan.DM,
			private: true,
			creation: date,
			owner: user,
		});
		this.addMember(user, dm.title);
		this.addMember(user2, dm.title);
		return dm;
	}

	async newConnection(newUser: UserEntity) {
		let channels: ChannelEntity[] = await this.getAllPublicChannels();
		for (let channel of channels) this.addMember(newUser, channel.title);
	}

	async chanWithPassword(user: UserEntity, informations: JoinChanDto) {
		let channel: ChannelEntity = await this.getChanByName(informations.title);
		if (channel.password == informations.password) return true;
		return false;
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
	 */
	async modifyChannel(user: UserEntity, modifications: ModifyChanDto) {
		const channel: ChannelEntity = await this.getChanByName(
			modifications.title,
		);
		if (channel.DM) return;
		if (modifications.newPassword || modifications.protected)
			await this.modifyPassword(
				user,
				channel,
				modifications.newPassword,
				modifications.protected,
			);
		if (modifications.newAdmin)
			await this.modifyAdmins(user, channel, modifications.newAdmin);
		if (modifications.newMember)
			await this.modifyMembers(user, channel, modifications.newMember);
		if (modifications.newBan)
			await this.addBanMembers(user, channel, modifications.newBan);
		if (modifications.newMute)
			await this.addMuteMembers(user, channel, modifications.newMute);
		if (modifications.deleteBan)
			await this.deleteBanMember(user, channel, modifications.deleteBan);
		if (modifications.deleteMute)
			await this.deleteMuteMember(user, channel, modifications.deleteMute);
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
	async modifyPassword(
		user: UserEntity,
		channel: ChannelEntity,
		newPassword: string,
		protection: boolean,
	) {
		if (channel?.owner.userId != user.userId)
			console.log(`You can't modify the channel`);
		else if (protection) {
			channel.protected = false;
			channel.password = null;
		} else {
			channel.protected = true;
			channel.password = await bcrypt.hash(newPassword, 10);
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
	async modifyAdmins(
		user: UserEntity,
		channel: ChannelEntity,
		newAdmin: string,
	) {
		if (
			channel.admins.find(
				(admin: UserEntity) => admin.username === user.username,
			)
		) {
			let userToAdd: UserEntity = await this.userService.getUserByUsername(
				newAdmin,
			);
			if (!channel.admins.includes(userToAdd)) {
				await this.addAdmin(userToAdd, channel.title);
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
	async modifyMembers(
		invitingUser: UserEntity,
		channel: ChannelEntity,
		newMember: string,
	) {
		let user: UserEntity = await this.userService.getUserByUsername(newMember);
		if (
			channel?.private &&
			channel.members.find(
				(member: UserEntity) => member.username === invitingUser.username,
			)
		) {
			if (!channel.members.includes(user)) {
				await this.addMember(user, channel.title);
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
	 */
	async deleteChan(user: UserEntity, chanName: string) {
		const channel: ChannelEntity = await this.getChanByName(chanName);
		if (
			channel.admins.find(
				(admin: UserEntity) => admin.username === user.username,
			)
		) {
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
	 *
	 * @param modifyingUser
	 * @param newModifiedUser
	 * @param channel
	 *
	 * @todo faire un check sur userId plutot que username non?
	 */
	async checkConditionOfModifications(
		modifyingUser: UserEntity,
		newModifiedUser: string,
		channel: ChannelEntity,
	): Promise<UserEntity> {
		let modifiedUser: UserEntity = await this.userService.getUserByUsername(
			newModifiedUser,
		);
		if (
			modifiedUser &&
			modifiedUser != modifyingUser &&
			channel.members.find(
				(member: UserEntity) => member.username === modifiedUser.username,
			) &&
			channel.admins.find(
				(admin: UserEntity) => admin.username === modifyingUser.username,
			) &&
			channel.owner.userId != modifiedUser.userId
		)
			return modifiedUser;
		return null;
	}

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

	async addMember(user: UserEntity, chanName: string) {
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
	async addAdmin(user: UserEntity, chanName: string) {
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
	async addBanMembers(
		banningUser: UserEntity,
		channel: ChannelEntity,
		newBanUser: string,
	) {
		let newBan: UserEntity = await this.checkConditionOfModifications(
			banningUser,
			newBanUser,
			channel,
		);
		if (newBan) {
			channel.bannedMembers = [...channel.bannedMembers, newBan];
			await channel.save();
			this.deleteMember(newBan, channel);
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
	async addMuteMembers(
		muttingUser: UserEntity,
		channel: ChannelEntity,
		newMuteUser: string,
	) {
		let newMute: UserEntity = await this.userService.getUserByUsername(
			newMuteUser,
		);
		if (
			newMute &&
			muttingUser != newMute &&
			channel.members.find(
				(member: UserEntity) =>
					member.username === newMute.username &&
					channel.admins.find(
						(admin: UserEntity) => admin.username === muttingUser.username,
					),
			) &&
			channel.owner.userId != newMute.userId
		) {
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
	async deleteBanMember(
		unbanningUser: UserEntity,
		channel: ChannelEntity,
		deleteBanUser: string,
	) {
		console.log(`enter in delete ban`);
		let deleteBan: UserEntity = await this.userService.getUserByUsername(
			deleteBanUser,
		);
		if (
			deleteBan &&
			unbanningUser != deleteBan &&
			channel.admins.find(
				(admin: UserEntity) => admin.username === unbanningUser.username,
			) &&
			channel.owner.userId != deleteBan.userId
		) {
			console.log(`conditions ok`);
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
	async deleteMuteMember(
		unmuttingUser: UserEntity,
		channel: ChannelEntity,
		deleteMuteUser: string,
	) {
		let deleteMute: UserEntity = await this.userService.getUserByUsername(
			deleteMuteUser,
		);
		if (
			deleteMute &&
			unmuttingUser != deleteMute &&
			channel.admins.find(
				(admin: UserEntity) => admin.username === unmuttingUser.username,
			) &&
			channel.owner.userId != deleteMute.userId
		) {
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
	async deleteMember(userToDelete: UserEntity, channel: ChannelEntity) {
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
	async getAllChannels(): Promise<ChannelEntity[]> {
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
	async getMemberChannels(member: UserEntity): Promise<ChannelEntity[]> {
		let channels: ChannelEntity[] = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.members', 'members')
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
			.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
			.leftJoinAndSelect('channel.admins', 'admins')
			.where('channel.private = false')
			.orWhere('members.userId = :id', { id: member.userId })
			.orderBy('channel.update', 'DESC')
			.getMany();
		return channels;
	}

	async getAllPublicChannels(): Promise<ChannelEntity[]> {
		let channels: ChannelEntity[] = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.members', 'members')
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
			.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
			.leftJoinAndSelect('channel.admins', 'admins')
			.where('channel.private = false')
			.getMany();
		return channels;
	}

	/**
	 * @brief Retrouver un channel avec son nom
	 *
	 */
	async getChanByName(chanName: string): Promise<ChannelEntity> {
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
		if (!channel) return null;
		return channel;
	}

	/**
	 * @brief Permet de n'avoir pas 2 channel du meme nom.
	 *
	 * @param chanName
	 * @TODO check if name is unique directly in DB
	 */
	async getIfUniqueName(chanName: string): Promise<boolean> {
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
	async sendMessage(user: UserEntity, payload: string[]) {
		const date = Date.now();
		let channel: ChannelEntity = await this.getChanByName(payload[1]);
		const new_msg = await this.messageService.addNewMessage(
			user,
			channel,
			payload[0],
		);
		channel.update = date;
		return new_msg;
	}
}
