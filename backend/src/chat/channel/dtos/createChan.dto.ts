import { IsNotEmpty } from "class-validator";

export class CreateChanDto {

	@IsNotEmpty({message: 'Channel needs a title'})
	title: string;

	@IsNotEmpty({ message: 'Channel should have an owner'})
	owner: string;

}
