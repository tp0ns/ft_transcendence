import {
	Body,
	Controller,
	Delete,
	Param,
	Post,
	Put,
	Req,
	UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { Request } from 'express';
import { RelationsService } from './relations.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UpdateRequestStatusDto } from '../user/dtos/UpdateRequestStatusDto';
import { Relation, RelationStatus } from './models/relations.interface';

@ApiTags('users')
@Controller('users/relations')
export class RelationsController {
	constructor(private relationsService: RelationsService) {}

	@UseGuards(JwtAuthGuard)
	@Post('relations/friend-request/send/:receiverUsername')
	sendFriendRequest(
		@Param('receiverUsername') receiverUsername: string,
		@Req() req: Request,
	) {
		console.log(req.user);
		// const user: User = req.user;
		return this.relationsService.sendFriendRequest(receiverUsername, req.user);
	}

	@ApiBody({ type: UpdateRequestStatusDto })
	@UseGuards(JwtAuthGuard)
	@Put('relations/friend-request/respond/:relationRequestId')
	async respondToFriendRequest(
		@Param('relationRequestId') relationRequestId: string,
		@Body() statusResponse: RelationStatus,
		// @Req() req: Request,
	): Promise<Relation> {
		return await this.relationsService.respondToFriendRequest(
			relationRequestId,
			statusResponse.status,
		);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('relations/unfriend/:relationId')
	async unfriend(
		@Param('relationRequestId') relationRequestId: string,
		@Req() req: Request,
	): Promise<boolean> {
		return await this.relationsService.unfriend(relationRequestId, req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Post('relations/block/:receiverUsername')
	async blockUser(
		@Param('receiverUsername') receiverUsername: string,
		@Req() req: Request,
	): Promise<Relation | { error: string }> {
		return await this.relationsService.blockUser(receiverUsername, req.user);
	}

	@UseGuards(JwtAuthGuard)
	@Delete('relations/unblock/:relationId')
	async unblockUser(
		@Param('relationRequestId') relationRequestId: string,
		@Req() req: Request,
	): Promise<boolean> {
		return await this.relationsService.unblockUser(relationRequestId, req.user);
	}
}
