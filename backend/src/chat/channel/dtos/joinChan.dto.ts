import { IsNotEmpty } from 'class-validator';

export class JoinChanDto {
	@IsNotEmpty()
	id: string;

	password?: string;
}
