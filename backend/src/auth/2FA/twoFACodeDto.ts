import { IsNumberString } from 'class-validator';

export class TwoFACodeDto {
	@IsNumberString()
	twoFACode: string;
}
