import {
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
} from '@nestjs/common';
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
import { WsException } from '@nestjs/websockets';
import { validate as isValidUUID } from 'uuid';
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
	 * ------------------------ CREATE CHANNEL  ------------------------- *
	 * 
	 * - createNewChan(user, chan)
	 * - createNewDM(user, chan)
	 * - saveNewChan(user, chan)
	 * - saveNewDM(user, chan)
	 *
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
		let channel: ChannelEntity;
		channel = await this.saveNewChan(user, chan);
		return channel;
	}

	/**
	 * @brief Setup d'un DM :
	 * - verifier s'il n'existe pas deja
	 * - creation d'un DM entre 2 users sinon
	 *
	 * @param user le user qui envoie l'invitation
	 * @param chan les informations du DM
	 * @returns ou le DM qui existe deja ou celui
	 * qui vient d'etre cree
	 *
	 */
	async createNewDM(
		user: UserEntity,
		chan: CreateChanDto,
	): Promise<ChannelEntity> {
		const userToInvite: UserEntity = await this.userService.getUserById(
			chan.user2,
		);
		if (!userToInvite)
			throw new WsException(
				'The user you want to invite to DM does not exist.',
			);
		let DM: ChannelEntity = await this.channelRepository.findOne({
			relations: ['members', 'owner', 'userInProtectedChan'],
			where: [
				{
					DM: true,
					owner: { userId: user.userId },
					user2: { userId: userToInvite.userId },
				},
				{
					DM: true,
					owner: { userId: userToInvite.userId },
					user2: { userId: user.userId },
				},
			],
		});
		if (!DM) DM = await this.saveNewDM(user, chan);
		return DM;
	}

	/**
	 *
	 * @brief Si ce n'est pas un DM, creation d'un nouveau channel
	 * avec tous les elements envoyes
	 *
	 * @param user l'utilisateur qui souhaite creer le channel
	 * @param chan le channel une fois crée
	 */
	async saveNewChan(
		user: UserEntity,
		chan: CreateChanDto,
	): Promise<ChannelEntity> {
		const date = Date.now();
		let channel: ChannelEntity;
		if (chan.DM) return this.saveNewDM(user, chan);
		const newPassword =
			chan.password != '' ? bcrypt.hashSync(chan.password, 10) : null;
		channel = await this.channelRepository.save({
			title: chan.title,
			owner: user,
			password: newPassword,
			private: chan.private,
			protected: chan.protected,
			DM: chan.DM,
		});
		await this.addMember(user, channel.channelId);
		await this.addAdmin(user, channel.channelId);
		if (!channel.private) {
			let users: UserEntity[] = await this.userService.getAllUsers();
			for (const newUser of users) {
				if (user.userId != newUser.userId)
					await this.addMember(newUser, channel.channelId);
			}
		}
		return channel;
	}

	/**
	 *
	 * @brief Permet de creer une conversation seulement entre 2 user
	 *
	 * @param user le user qui souhaite creer le DM
	 * @param chan les informations pour creer le channel a valeur de DM
	 *
	 */
	async saveNewDM(user: UserEntity, chan: CreateChanDto) {
		let userToAdd: UserEntity = await this.userService.getUserById(chan.user2);
		let dm: ChannelEntity = await this.channelRepository.save({
			title: chan.title,
			DM: chan.DM,
			private: true,
			owner: user,
			user2: userToAdd,
		});
		await this.addMember(user, dm.channelId);
		await this.addMember(userToAdd, dm.channelId);
		return dm;
	}

/**
	 * ------------------------ MODIFY CHANNEL  ------------------------- *
	 *
	 * -  newConnection(newUser)
	 * - chanWithPassword(user, informations)
	 * - modifyChannel(user, modifications)
	 *       + modifyPassword(user, channel, newPassword, protection)
	 *       + deleteChan(user, chanId)
	 * - joinRoom(user, channel)
	 * - quitChan(user, chanId)
	 */


	/**
	 * @brief Permet d'ajouter le nouvel utilisateur a tous les channels publics
	 * qui existe deja
	 *
	 * @param newUser le nouvel utilisateur qui se connecte
	 */
	async newConnection(newUser: UserEntity) {
		let channels: ChannelEntity[] = await this.getAllPublicChannels();
		for (let channel of channels)
			await this.addMember(newUser, channel.channelId);
	}

	/**
	 * @brief Verifie la validite du password entrer par l'utilisateur
	 *
	 * @param user l'utilisateur qui souhaite entrer dans un channel protege
	 * @param informations le titre du channel + la tentative de mot de passe
	 * @returns true si le mot de passe est bon / false sinon
	 */
	async chanWithPassword(user: UserEntity, informations: JoinChanDto) {
		let channel: ChannelEntity = await this.getChanByIdWithPassword(informations.id);
		const checkPassword: boolean = await bcrypt.compare(
			informations.password,
			channel.password,
		);
		if (checkPassword) {
			await this.addUserInProtectedChan(user, channel);
			return true;
		}
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
		const channel: ChannelEntity = await this.getChanById(modifications.id);
		if (channel.DM) return;
		if (modifications.newAdmin)
			await this.modifyAdmins(user, channel, modifications.newAdmin);
		else if (modifications.newMember)
			await this.modifyMembers(user, channel, modifications.newMember);
		else if (modifications.newBan)
			await this.addBanMembers(user, channel, modifications.newBan);
		else if (modifications.newMute)
			await this.addMuteMembers(user, channel, modifications.newMute);
		else if (modifications.deleteBan)
			await this.deleteBanMember(user, channel, modifications.deleteBan);
		else if (modifications.deleteMute)
			await this.deleteMuteMember(user, channel, modifications.deleteMute);
		else //if (modifications.newPassword || !modifications.protected) 
		{
			await this.modifyPassword(
				user,
				channel,
				modifications.newPassword,
				modifications.protected,
			);
		}
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
		if (!channel.adminsId.includes(user.userId)) {
			throw new WsException("You can't modify the channel");
		} else if (protection && !newPassword)
			throw new WsException(
				'You need to enter a password if you want to protect this channel',
			);
		else if (newPassword && protection) {
			channel.protected = true;
			channel.password = await bcrypt.hash(newPassword, 10);
			channel.userInProtectedChan = null;
		} else {
			channel.protected = false;
			channel.password = null;
		}
		await this.channelRepository.save(channel);
	}

	/**
	 * @brief Suppression d'un channel
	 *
	 * @param user le user qui souhaite supprimer le channel :
	 * -> seulement le owner
	 * @param chanName le channel a supprimer
	 *
	 */
	async deleteChan(user: UserEntity, chanId: string) {
		const channel: ChannelEntity = await this.getChanById(chanId);
		if (user === null || channel.adminsId.includes(user.userId)) {
			await this.channelRepository
				.createQueryBuilder()
				.delete()
				.from(ChannelEntity)
				.where('channelId = :chanId', { chanId: channel.channelId })
				.execute();
		}
	}

	/**
	 * @brief verifier que les conditions a la modification sont remplies
	 *
	 * @param modifyingUser le user qui souhaite modifier le channel
	 * @param newModifiedUser le user qui va etre modifie
	 * @param channel le channel concerne par la modification
	 *
	 */
	async checkConditionOfModifications(
		modifyingUser: UserEntity,
		newModifiedUser: string,
		channel: ChannelEntity,
	): Promise<UserEntity> {
		let modifiedUser: UserEntity = await this.userService.getUserById(
			newModifiedUser,
		);
		if (
			modifiedUser &&
			modifiedUser != modifyingUser &&
			channel.adminsId.includes(modifyingUser.userId) &&
			channel.owner.userId != modifiedUser.userId
		)
			return modifiedUser;
		return null;
	}

		/**
	 * @brief Determiner si le user est bien membre
	 *
	 * @param user le user qui veut join la room
	 * @param channel le channel qui permet de join la room
	 * @returns
	 */
	async joinRoom(user: UserEntity, channel: ChannelEntity)
	{
		if (channel.membersId.includes(user.userId))
			return true;
		else
			throw new WsException('You need to be a member to join the room')
	}

	/**
	 * @brief Permet de quitter un channel
	 *
	 * @param user l'utilisateur qui souhaite quitter le channel
	 * @param chanId l'identifiant du channel
	 */
	async quitChan(user: UserEntity, chanId: string): Promise<ChannelEntity> {
		const channel: ChannelEntity = await this.getChanById(chanId);
		if (
			channel.members.find(
				(member: UserEntity) =>
					member.userId === user.userId && channel.DM === false,
			)
		) {
			await this.deleteMember(user, channel);
			if (channel.adminsId.includes(user.userId))
				this.deleteAdmin(user, channel);
			if (channel.owner.userId === user.userId)
				channel.owner = null;
			await channel.save();
			if (channel.members.length <= 0) this.deleteChan(null, channel.channelId);
		}
		return channel;
	}


	/**
	 * ------------------------ MODIFY MEMBERS LIST  ------------------------- *
	 *
	 * - modifyAdmins(user, channel, newAdmin)
	 * - modifyMembers(invitingUser, channel, newMember)
	 * - addMember(user, chanId)
	 * - addUserInProtectedChan(user, channel)
	 * - addAdmin(user, chanId)
	 * - addBanMembers(banningUser, channel, newBanUser)
	 * - addMuteMembers(muttingUser, channel, newMuteUser)
	 * - deleteBanMember(unbanningUser, channel, deleteBanUser)
	 * - deleteMuteMember(unmuttingUser, channel, deleteMuteUser)
	 * - deleteMember(userToDelete, channel)
	 * - deleteAdmin(userToDelete, channel)
	 */


	/**
	 * @brief Ajout d'un admin
	 *
	 * @param user le user qui souhaite effectuer la modification
	 * -> doit etre admin
	 * @param modifications l'interface dans laquelle un username dans admin
	 * sera rempli pour ajouter un admin au channel.
	 *
	 *
	 */
	 async modifyAdmins(
		user: UserEntity,
		channel: ChannelEntity,
		newAdmin: string,
	) {
		if (channel.adminsId.includes(user.userId)) {
			let userToAdd: UserEntity = await this.userService.getUserById(newAdmin);
			if (!channel.adminsId.includes(userToAdd.userId)) {
				await this.addAdmin(userToAdd, channel.channelId);
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
	 */
	async modifyMembers(
		invitingUser: UserEntity,
		channel: ChannelEntity,
		newMember: string,
	) {
		let user: UserEntity = await this.userService.getUserByUsername(newMember);
		if (!user) throw new WsException("This user doesn't exist");
		if (channel?.private && channel.membersId.includes(invitingUser.userId)) {
			if (channel.membersId.includes(user.userId))
				throw new WsException('This user is already in this channel');
			else await this.addMember(user, channel.channelId);
		}
	}

	/**
	 * @brief Ajout d'un membre dans le channel
	 * -> lors d'un unban
	 * -> lors de l'ajout d'un membre : dans un chan privee
	 * -> pour tous les users connectes : dans un chan public
	 *
	 * @param user le user qui rejoint le channel
	 * @param chanName le nom du channel
	 *
	 */

	async addMember(user: UserEntity, chanId: string) {
		let channel: ChannelEntity = await this.getChanById(chanId);
		if (channel) {
			channel.members = [...channel.members, user];
			await channel.save();
		}
	}

	/**
	 * @brief permet d'identifier les personnes qui ont entres le bon mdp
	 * -> sont supprimes de la liste si le mdp est modifie
	 *
	 * @param user le user qui a entrer le bon mdp
	 * @param channel le channel protege
	 */
	async addUserInProtectedChan(user: UserEntity, channel: ChannelEntity) {
		channel.userInProtectedChan = [...channel.userInProtectedChan, user];
		await channel.save();
	}

	/**
	 * @brief Ajout d'un admin dans un channel
	 *
	 * @param user le user qui rejoint le channel en tant qu'admin
	 * @param chanName le nom du channel
	 *
	 */
	async addAdmin(user: UserEntity, chanId: string) {
		let channel: ChannelEntity = await this.getChanById(chanId);
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
		if (newBan && channel.membersId.includes(newBan.userId)) {
			channel.bannedMembers = [...channel.bannedMembers, newBan];
			await this.deleteMember(newBan, channel);
			await channel.save();
		}
	}

	/**
	 * @brief Ajout d'un user en tant que membre mute
	 *
	 * @param muttingUser le user qui souhaite mute
	 * -> doit etre admin
	 * @param userToMute le user a mute
	 * -> doit etre membre du channel
	 * @param chanName le nom du channel
	 *
	 *
	 */
	async addMuteMembers(
		muttingUser: UserEntity,
		channel: ChannelEntity,
		newMuteUser: string,
	) {
		let newMute: UserEntity = await this.checkConditionOfModifications(
			muttingUser,
			newMuteUser,
			channel,
		);
		if (newMute && channel.membersId.includes(newMute.userId)) {
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
	 * @param chanName nom du channel
	 *
	 *
	 */
	async deleteBanMember(
		unbanningUser: UserEntity,
		channel: ChannelEntity,
		deleteBanUser: string,
	) {
		let deleteBan: UserEntity = await this.checkConditionOfModifications(
			unbanningUser,
			deleteBanUser,
			channel,
		);

		if (deleteBan) {
			channel.bannedMembers = channel.bannedMembers.filter((banned) => {
				return banned.userId !== deleteBan.userId;
			});
			await channel.save();
			await this.addMember(deleteBan, channel.channelId);
		}
	}

	/**
	 * @brief Suppression d'un user mute
	 *
	 * @param unmuttingUser le user qui souhaite unmute
	 * @param userToUnmute le user unmute
	 * @param chanName
	 *
	 */
	async deleteMuteMember(
		unmuttingUser: UserEntity,
		channel: ChannelEntity,
		deleteMuteUser: string,
	) {
		let deleteMute: UserEntity = await this.checkConditionOfModifications(
			unmuttingUser,
			deleteMuteUser,
			channel,
		);
		if (deleteMute) {
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
	}

	/**
	 * @brief Suppression d'un user de la liste des admins du channel
	 *
	 * @param userToDelete le user a supprimer
	 * @param channel le channel concernee
	 */
	async deleteAdmin(userToDelete: UserEntity, channel: ChannelEntity) {
		channel.admins = channel.admins.filter((admin) => {
			return admin.userId !== userToDelete.userId;
		});
	}

	/**
	 * ------------------------ GETTERS  ------------------------- *
	 *
	 * - getAllChannels()
	 * - getMemberChannels(member)
	 * - getAllPublicChannels()
	 * - getChanById(chanId)
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
				'userInProtectedChan',
			],
		});
		return channels;
	}

	/**
	 * @brief Permet de recuperer seulement les channels du user
	 * Autant privees que publiques
	 *
	 */
	async getMemberChannels(member: UserEntity): Promise<ChannelEntity[]> {
		const testChannelsIds = await this.channelRepository
			.query(`SELECT "channelId" id FROM channel
			JOIN channel_members_user_entity chmember ON chmember."channelChannelId" = channel."channelId"
			WHERE chmember."userEntityUserId" = '${member.userId}'`);
		let channelIds = testChannelsIds.map((channel) => channel.id);
		if (channelIds.length != 0) {
			return this.channelRepository
				.createQueryBuilder('channel')
				.leftJoinAndSelect('channel.members', 'members')
				.leftJoinAndSelect('channel.owner', 'owner')
				.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
				.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
				.leftJoinAndSelect('channel.admins', 'admins')
				.where('channel.channelId IN (:...channelIds)', {
					channelIds,
				})
				.getMany();
		}
		return [];
	}

	/**
	 *
	 * @brief Permet de recuperer tous les channels public du chat
	 *
	 * => me permettra d'ajouter tous les utilisateurs connectes a
	 * tous les channels publics
	 */
	async getAllPublicChannels(): Promise<ChannelEntity[]> {
		let channels: ChannelEntity[] = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.members', 'members')
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
			.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
			.leftJoinAndSelect('channel.admins', 'admins')
			.leftJoinAndSelect('channel.userInProtectedChan', 'userInProtectedChan')
			.where('channel.private = false')
			.getMany();
		return channels;
	}

	/**
	 * @brief Recuperer un channel avec son id 
	 * 
	 */
	async getChanById(chanId: string): Promise<ChannelEntity> {
		if (isValidUUID(chanId)) {
			let channel: ChannelEntity = await this.channelRepository
			.createQueryBuilder('channel')
			.leftJoinAndSelect('channel.members', 'members')
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
			.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
			.leftJoinAndSelect('channel.admins', 'admins')
			.leftJoinAndSelect('channel.userInProtectedChan', 'userInProtectedChan')
			.where('channel.channelId = :id', {id: chanId})
			.getOne();
			return channel;
		}
		throw new WsException('channel not found');
	}

	/**
	 * @brief Recuperer un channel avec son id et son password 
	 * -> Permet de ne pas envoyer le password dans les recuperations
	 * des channels de base
	 * 
	 */
	async getChanByIdWithPassword(chanId: string): Promise<ChannelEntity> {
		if (isValidUUID(chanId)) {
			let channel: ChannelEntity = await this.channelRepository
			.createQueryBuilder('channel')
			.addSelect('channel.password',)
			.leftJoinAndSelect('channel.members', 'members')
			.leftJoinAndSelect('channel.owner', 'owner')
			.leftJoinAndSelect('channel.bannedMembers', 'bannedMembers')
			.leftJoinAndSelect('channel.mutedMembers', 'mutedMembers')
			.leftJoinAndSelect('channel.admins', 'admins')
			.leftJoinAndSelect('channel.userInProtectedChan', 'userInProtectedChan')
			.where('channel.channelId = :id', {id: chanId})
			.getOne();
			return channel;
		}
		throw new WsException('channel not found');
	}

	/**
	 * ------------------------ MESSAGES  ------------------------- *
	 *
	 * - sendMessage(user, payload)
	 */

	/**
	 * @brief Stocke le message envoyer dans le DB
	 *
	 * @param user le user qui envoie le message
	 * @param payload un tableau avec les informations du messages envoye
	 */
	async sendMessage(user: UserEntity, payload: string[]) {
		const chanId: string = payload[1];
		const msg: string = payload[0];
		let channel: ChannelEntity = await this.getChanById(chanId);
		if (
			channel.mutedId.includes(user.userId) ||
			channel.bannedId.includes(user.userId) ||
			msg == ''
		)
			throw new WsException("You can't send a message");
		const new_msg = await this.messageService.addNewMessage(user, channel, msg);
		await channel.save();
		return new_msg;
	}
}
