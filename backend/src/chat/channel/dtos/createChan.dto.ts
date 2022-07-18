import { IsNotEmpty } from "class-validator";
import { User } from "src/user/user.entity";

export class CreateChanDto {

	@IsNotEmpty({message: 'Channel needs a title'})
	title: string;


}
