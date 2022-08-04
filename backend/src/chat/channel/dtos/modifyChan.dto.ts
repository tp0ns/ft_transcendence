import { IsNotEmpty } from 'class-validator';

export class ModifyChanDto {
	@IsNotEmpty({ message: 'Channel needs a title' })
	title: string;

	newMember?: string;

	newPassword?: string;

	newAdmin?: string;

	newBan?: string;

	newMute?: string;

	deleteBan?: string;

	deleteMute?: string;

	protected?: boolean;
}
