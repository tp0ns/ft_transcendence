import {
	ForbiddenException,
	forwardRef,
	HttpException,
	HttpStatus,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'passport-42';
import {
	Relation,
	RelationStatus,
	Relation_Status,
} from '../relations/models/relations.interface';
import { RelationEntity } from '../relations/models/relations.entity';
import { ChannelService } from 'src/chat/channel/channel.service';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,
	) {}

	/**
	 * Return un profile dont le schoolId correspond au profile.id passé en param, si il
	 * n'existe pas le crée et le renvoie.
	 * @param profile ce que le premier call à l'API 42 a return, voir @param profileFields
	 * @returns un UserEntity
	 */
	async findOrCreate(profile: Profile): Promise<UserEntity> {
		let user: UserEntity = await this.userRepo.findOne({
			where: { schoolId: profile.id },
		});
		if (!user) {
			while (
				(user = await this.userRepo.findOne({
					where: { username: profile.username },
				}))
			) {
				profile.username += Math.floor(1 + Math.random() * 999).toString();
			}
			let newUser: UserEntity = await this.userRepo.save({
				schoolId: profile.id,
				username: profile.username,
				image_url: profile.image_url,
			});
			this.channelService.newConnection(newUser);
			return newUser;
		}
		return user;
	}

	async setTwoFASecret(secret: string, userId: string) {
		return this.userRepo.update(userId, {
			twoFASecret: secret,
		});
	}

	async turnOnTwoFA(userId: string) {
		return await this.update(userId, {
			isTwoFAEnabled: true,
		});
	}

	async getUserById(id: string) {
		const user = await this.userRepo.findOne({ where: { userId: id } });
		if (!user) {
			throw new NotFoundException('user not found');
		}
		return user;
	}

	async getUserByUsername(username: string) {
		const user = await this.userRepo.findOne({ where: { username: username } });
		if (!user) {
			return null;
		}
		return user;
	}

	async getAllUsers() {
		const users: UserEntity[] = await this.userRepo.find();
		return users;
	}

	/* This functions takes a user_id and updates it with the attributes of its entity to be updated.
	These are represented by the Partial<UserEntity> parameter (Partial<> permits to give as arguments parts of an entity)*/
	async update(id: string, attrs: Partial<UserEntity>) {
		const user = await this.userRepo.findOne({ where: { userId: id } });
		if (!user) {
			throw new NotFoundException('user not found');
		}
		while (attrs.username === user.username) {
			attrs.username += Math.floor(Math.random() * (999 - 100 + 1) + 100);
		}
		Object.assign(user, attrs);
		return this.userRepo.save(user);
	}
	// async	createUser(newUser: CreateUserDto) {
	// 	return await this.userRepo.save(newUser);
	// }
}
