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

	async createNewMember(newUser: UserEntity, chan: ChannelEntity) : Promise<MembersEntity> {
		try {
		return (await this.MembersRepository.save({
			user: newUser, 
			channel: chan
		}));
		}
		catch {
			//error
		}
	}

}

