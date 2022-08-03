import { IsNotEmpty } from 'class-validator';

export class ModifyChanDto {
	@IsNotEmpty({ message: 'Channel needs a title' })
	title: string;

	member?: string;

	password?: string;

	private?: string;

	admin?: string;
}
