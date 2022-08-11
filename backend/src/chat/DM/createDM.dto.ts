import { IsNotEmpty } from 'class-validator';

export class CreateDMDto {
	@IsNotEmpty({ message: 'DM needs a user to invite' })
	userToInvite: string;

	
}
