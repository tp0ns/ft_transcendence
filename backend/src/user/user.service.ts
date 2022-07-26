import {
	ForbiddenException,
	HttpException,
	HttpStatus,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { UserEntity } from './models/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidv4 } from 'uuid';
import { Profile } from 'passport-42';
import { from, map, Observable, of, switchMap } from 'rxjs';
import {
	Relation,
	RelationStatus,
	Relation_Status,
} from './relations/models/relations.interface';
import { RelationEntity } from './relations/models/relations.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
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
			console.log(profile.username);
			while (
				(user = await this.userRepo.findOne({
					where: { username: profile.username },
				}))
			) {
				profile.username += Math.floor(1 + Math.random() * 999).toString();
			}
			return await this.userRepo.save({
				schoolId: profile.id,
				username: profile.username,
				image_url: profile.image_url,
			});
		}
		return await user;
	}

	async setTwoFASecret(secret: string, userId: string) {
		return this.userRepo.update(userId, {
			twoFASecret: secret,
		});
	}
	async turnOnTwoFA(userId: string) {
		return this.userRepo.update(userId, {
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
			throw new NotFoundException('user not found');
		}
		return user;
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
		console.log(user);
		return this.userRepo.save(user);
	}
	// async	createUser(newUser: CreateUserDto) {
	// 	return await this.userRepo.save(newUser);
	// }
}
