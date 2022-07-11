import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/user.dto';
import { uuidv4 } from 'uuid'

@Injectable()
export class UserService {
	constructor(@InjectRepository(User)
		private repo: Repository<User>) {}

	async getUserById(id: uuidv4) {
		const user = await this.repo.findOne({where: {id: id}})
		if (!user) {
			throw new NotFoundException('user not found');
		}
		return user;
	}

	async	createUser(newUser: CreateUserDto) {
		return await this.repo.save(newUser);
	}

	async setTwoFASecret(secret: string, userId: string) {
		return this.repo.update(userId, {
			twoFASecret: secret,
		})
	}
	async turnOnTwoFA(userId: string) {
		return this.repo.update(userId, {
			isTwoFAEnabled: true
		});
	}
}
