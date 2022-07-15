import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class uuidDto {
	@ApiProperty()
	@IsUUID()
	id: string;
}
