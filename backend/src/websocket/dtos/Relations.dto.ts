import { IsNotEmpty } from 'class-validator';
import { IsString } from 'class-validator';

export class UsernameDto {
	@IsNotEmpty({ message: 'Channel needs a title' })
	@IsString()
	username: string;
}

export class IdDto {
	@IsNotEmpty({ message: 'Channel needs a title' })
	@IsString()
	id: string;
}