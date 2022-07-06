import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/user.dto';
import { uuidv4 } from 'uuid'

@Injectable()
export class UserService {
	constructor(@InjectRepository(User) private repo: Repository<User>) {}

	async getUserById(id: uuidv4) {
		return await this.repo.findOne({where: {id: id}});
	}

	async	createUser(newUser: CreateUserDto) {
		return await this.repo.save(newUser);
	}
}
