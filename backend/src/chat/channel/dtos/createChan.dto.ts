import { IsAlphanumeric, IsNotEmpty, MaxLength } from 'class-validator';
import UserEntity from 'src/user/models/user.entity';

export class CreateChanDto {
	@MaxLength(21)
	@IsAlphanumeric()
	@IsNotEmpty()
	title: string;

	password: string;

	protected: boolean;

	private: boolean;

	DM: boolean;

	user2?: string;
}
