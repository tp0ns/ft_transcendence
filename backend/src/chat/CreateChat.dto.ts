import { IsBoolean, isBoolean, IsNotEmpty } from "class-validator";
import { User } from "src/user/user.entity";

export class CreateChatDto {

	@IsNotEmpty({message: 'need title'})
	title: string;

	owner: User;
	

}