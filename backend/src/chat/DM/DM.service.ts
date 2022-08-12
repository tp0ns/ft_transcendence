import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import UserEntity from "src/user/models/user.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { MessageService } from "../messages/messages.service";
import { CreateDMDto } from "./createDM.dto";
import { DMEntity } from "./DM.entity";

@Injectable()
export class DMService {
	constructor(
		@InjectRepository(DMEntity)
		private DMRepository: Repository<DMEntity>,
		@Inject(forwardRef(() => MessageService))
		private messageService: MessageService,
		@Inject(forwardRef(() => UserService)) private userService: UserService,
	) {}

	/**
	 * 
	 * @param user1 
	 * @param chan 
	 * @returns 
	 * 

	 */
	async createNewDM(user1: UserEntity, userToInvite: string) : Promise<DMEntity>
	{
		let DM: DMEntity;
		let user2 : UserEntity = await this.userService.getUserByUsername(userToInvite);
		const date = new Date();
		if (await this.checkIfDMalreadyExist(user1, user2) == true)
		{
			DM = await this.DMRepository.save({
				title: (user1.username+'+'+user2.username),
				creation: date,
				update: date,
				user1: user1,
				user2: user2,
				});
		}
		return DM;
	}

	/**
	 * 
	 * @param user user connected
	 * @returns all the DMs of the user
	 */
	async getMyDM(user: UserEntity) : Promise<DMEntity[]>
	{
		let DMs: DMEntity[] = await this.DMRepository
		.createQueryBuilder('DM')
		.leftJoinAndSelect('DM.user1', 'user1')
		.leftJoinAndSelect('DM.user2', 'user2')
		.where('user1.userId = :id', { id: user.userId })
		.orWhere('user2.userId = :id', { id: user.userId})
		.getMany();
	return DMs;
	}


	async getAllDMs() : Promise<DMEntity[]>
	{
		const DMs: DMEntity[] = await this.DMRepository.find({
			relations: [
				'user2',
				'user1',
			],
		});
		return DMs;
	}

	async checkIfDMalreadyExist(user1: UserEntity, user2: UserEntity) 
	{
		let DMs: DMEntity[] = await this.getAllDMs();
		for (let DM of DMs)
		{
			if (user1.username == DM.user1.username || user1.username == DM.user2.username
				&& user2.username == DM.user1.username || user2.username == DM.user2.username)
				return false;
		}
		return true;
	}

}