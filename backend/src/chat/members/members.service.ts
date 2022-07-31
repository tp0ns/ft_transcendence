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
		console.log(`check user in member service : `, JSON.stringify(newUser));
		console.log(`check channel in meber service : `, JSON.stringify(chan));
		await this.MembersRepository.save({
			user: newUser, 
			channel: chan
	});

	}
}