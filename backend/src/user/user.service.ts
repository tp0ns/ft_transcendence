import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { uuidv4 } from 'uuid';
import { Profile } from 'passport-42';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private repo: Repository<User>,
	) {}

	async getUserById(id: uuidv4) {
		const user = await this.repo.findOne({ where: { userId: id } });
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	/**
	 * Return un profile dont le schoolId correspond au profile.id passé en param, si il
	 * n'existe pas le crée et le renvoie.
	 * @param profile ce que le premier call à l'API 42 a return, voir @param profileFields
	 * @returns un User
	 */
	async findOrCreate(profile: Profile): Promise<User> {
		const user: User = await this.repo.findOne({
			where: { schoolId: profile.id },
		});
		if (!user) {
			return await this.repo.save({
				schoolId: profile.id,
				username: profile.username,
				image_url: profile.image_url,
			});
		}
		return await user;
	}

	async setTwoFASecret(secret: string, userId: string) {
		return this.repo.update(userId, {
			twoFASecret: secret,
		});
	}
	async turnOnTwoFA(userId: string) {
		return this.repo.update(userId, {
			isTwoFAEnabled: true,
		});
	}
	// async	createUser(newUser: CreateUserDto) {
	// 	return await this.repo.save(newUser);
	// }
}
