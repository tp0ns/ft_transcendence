import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { Relation_Status } from '../relations/models/relations.interface';

export class UpdateRequestStatusDto {
	@ApiProperty()
	status: Relation_Status;
}
