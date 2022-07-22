import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { FriendRequest_Status } from '../models/friend-request.interface';

export class UpdateRequestStatusDto {
	@ApiProperty()
	status: FriendRequest_Status;
}
