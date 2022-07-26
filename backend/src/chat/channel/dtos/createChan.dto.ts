import { IsNotEmpty } from 'class-validator';

export class CreateChanDto {
	@IsNotEmpty({ message: 'Channel needs a title' })
	title: string;
}
