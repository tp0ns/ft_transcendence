import { IsEmpty } from "class-validator";

export class TwoFACodeDto {
 @IsEmpty()
 twoFACode: string;
}
