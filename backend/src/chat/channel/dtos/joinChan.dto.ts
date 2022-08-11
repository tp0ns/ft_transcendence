import { IsNotEmpty } from 'class-validator';

export class JoinChanDto {
	@IsNotEmpty()
	title: string;

	password?: string;
}
