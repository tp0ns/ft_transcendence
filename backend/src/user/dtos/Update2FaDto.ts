import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class Update2FaDto {
	@ApiProperty()
	twoFa: boolean;
}
