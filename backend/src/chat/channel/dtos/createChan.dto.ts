import { IsNotEmpty } from 'class-validator';
import UserEntity from 'src/user/models/user.entity';

export class CreateChanDto {
	@IsNotEmpty({ message: 'Channel needs a title' })
	title: string;

	password: string;

	protected: boolean;

	private: boolean;

	DM: boolean;

	user2?: string;

}
