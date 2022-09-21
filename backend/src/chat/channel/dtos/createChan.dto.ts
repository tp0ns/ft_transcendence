import { IsNotEmpty, MaxLength } from 'class-validator';
export class CreateChanDto {
	@MaxLength(21)
	@IsNotEmpty()
	title: string;

	password: string;

	protected: boolean;

	private: boolean;

	DM: boolean;

	user2?: string;
}
