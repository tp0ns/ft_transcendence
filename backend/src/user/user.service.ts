import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { EntityPropertyNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/user.dto';
import { uuidv4 } from 'uuid';
import { Profile } from 'passport-42'

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	async getUserById(id: uuidv4) {
		const user = await this.repo.findOne({where: {userId: id}})
		if (!user) {
			throw new NotFoundException('User not found');
		}
		return user;
	}

	async findOrCreate(profile: Profile): Promise<User> {
		const user: User = await this.repo.findOne({where: {schoolId: profile.id}})
		if(!user) {
			return await this.repo.save({
				schoolId: profile.id,
				username: profile.username,
				image_url: profile.image_url
			});
		}
		return await user;
	}

	// async	createUser(newUser: CreateUserDto) {
	// 	return await this.repo.save(newUser);
	// }
}
