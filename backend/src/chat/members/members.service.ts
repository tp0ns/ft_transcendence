import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import UserEntity from "src/user/models/user.entity";
import { Repository } from "typeorm";
// import { Channel } from "../channel/channel.entity";
import { MembersEntity } from "./members.entity";

@Injectable()
export class membersService {
	constructor(
		@InjectRepository(MembersEntity) private MembersRepository: Repository<MembersEntity>,
	) {}


	async getUserByRequest (req: Request) {
		const user: UserEntity = await this.getUserByIdentifier(JSON.parse(JSON.stringify(req.user)).userId);
		//verif que le user existe bien
		return (user);
	}
	// async createNewMember(newUser: UserEntity, chan: Channel) : Promise<MembersEntity> {
	// 	try {
	// 	return (await this.MembersRepository.save({
	// 		user: newUser, 
	// 		channel: chan
	// 	}));
	// 	}
	// 	catch {
	// 		//error
	// 	}
	// }

}