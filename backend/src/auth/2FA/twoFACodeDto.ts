import { IsString } from 'class-validator';

export class TwoFACodeDto {
	@IsString()
	public twoFACode: string;
}
