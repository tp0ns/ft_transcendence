import {
	ForbiddenException,
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'passport-42';
import { ChannelService } from 'src/chat/channel/channel.service';
import { WsException } from '@nestjs/websockets';
import { GameService } from 'src/game/game.service';
import { writeFile } from 'fs';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
		@Inject(forwardRef(() => ChannelService))
		private channelService: ChannelService,
		@Inject(forwardRef(() => GameService))
		private GameService: GameService,
	) { }

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
				status: 'connected',
				victories: 0,
				defeats: 0,
			});
			this.channelService.newConnection(newUser);
			this.GameService.newConnection(newUser);
			return newUser;
		} else {
			this.update(user.userId, { status: 'connected' });
		}
		return user;
	}

	async connectClient(userReq: Partial<UserEntity>) {
		const user: UserEntity = userReq as UserEntity;
		return this.userRepo.update(user.userId, {
			status: 'connected',
		});
	}

	async disconnectClient(userReq: Partial<UserEntity>) {
		const user: UserEntity = userReq as UserEntity;
		return await this.userRepo.update(user.userId, {
			status: 'disconnected',
		});
	}

	async playingClient(userReq: Partial<UserEntity>) {
		const user: UserEntity = userReq as UserEntity;
		return this.userRepo.update(user.userId, {
			status: 'playing',
		});
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
		// findOne({
		// 	relations: ['creator', 'receiver'],
		// 	where:
		if (!id) return;
		const user = await this.userRepo.findOne({
			relations: ['MatchHistory'],
			where: { userId: id },
		});
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

		if (await this.getUserByUsername(attrs.username))
			throw new ForbiddenException("username already taken");
		if (attrs.profileImage && attrs.profileImage.split(".").at(-1) != "png")
			throw new WsException('File needs to be .png type');
		Object.assign(user, attrs);
		return await this.userRepo.save(user);
	}

	async uploadFile(id: string, file: any) {
		const user = await this.userRepo.findOne({ where: { userId: id } });
		if (!user) {
			throw new NotFoundException('user not found');
		}
		writeFile("./uploads/profileimages/", file, () => { return; })
		// Object.assign(user, {profileImage: })
		console.log(file);
	}
	// async	createUser(newUser: CreateUserDto) {
	// 	return await this.userRepo.save(newUser);
	// }
}
