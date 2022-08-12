import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, isNotEmpty, IsUUID } from 'class-validator';

export class uuidDto {
	@ApiProperty()
	@IsUUID('all')
	@IsNotEmpty()
	id: string;
}
