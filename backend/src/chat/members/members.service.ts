import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import UserEntity from "src/user/models/user.entity";
import { Repository } from "typeorm";
import { ChannelEntity } from "../channel/channel.entity";
import { MembersEntity } from "./members.entity";

@Injectable()
export class membersService {
	constructor(
		@InjectRepository(MembersEntity) private MembersRepository: Repository<MembersEntity>,
	) {}

	async createNewMember(newUser: UserEntity, chan: ChannelEntity) : Promise<void> {
		await this.MembersRepository.save({
			user: newUser, 
			channel: chan
	});
	}

	async getMember(userToFind: UserEntity) //: Promise<MembersEntity> 
	{
		// let member : MembersEntity = await this.MembersRepository.findOne({where: {user: userToFind}})

		// return member;
	}
}