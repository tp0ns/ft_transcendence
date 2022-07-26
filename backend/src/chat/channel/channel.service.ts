import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import UserEntity from 'src/user/models/user.entity';
import { DataSource, Repository } from 'typeorm';
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

	async createNewChan(user: UserEntity, channel: CreateChanDto) {
		await this.channelRepository.save({
			title: channel.title,
			owner: user,
		});
		// return await this.joinChan(user, channel.title);
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

	async joinChan(user: UserEntity, channelName: string) {
		let channel: Channel;
		// try {
		channel = await this.getChanByName(channelName);
		//ajouter le user dans les members du channel
		// channel.usersIn.push(user);

		// await dataSource
		// .createQueryBuilder()
		// .relation(Post, "categories")
		// .of(post)
		// .add(category)

		// await Channel.createQueryBuilder().relation(Channel, "UsersIn").of(channel).add(user);

		// }
		// catch {
		// 	const infos = {
		// 		title: channelName,
		// 		owner : user,
		// 	}
		// 	this.createNewChan(user, infos);
		// }
	}

	/**
	 * @brief Find the channel to join with his name
	 *
	 * @param chanName
	 * @returns Channel object corresponding
	 *
	 * @todo faire un try/catch ?
	 */
	async getChanByName(chanName: string): Promise<Channel> {
		const channel: Channel = await this.channelRepository.findOne({
			where: { title: chanName },
		});
		if (!channel) console.log('le channel il existe po');
		return channel;
	}

	/**
	 * ------------------------ GETTERS  ------------------------- *
	 */

	async getAllChannels(): Promise<Channel[]> {
		const channels: Channel[] = await this.channelRepository.find();
		return channels;
	}
}
