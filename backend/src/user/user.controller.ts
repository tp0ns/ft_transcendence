import {
	Controller,
	Get,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Put,
	Req,
	Body,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
	ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from './storage/storage';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { uuidDto } from './dtos/uuidDto';
import { Request } from 'express';
import { UpdateUsernameDto } from './dtos/UpdateUsernameDto';
import { WsGuard } from 'src/auth/websocket/ws.guard';

@ApiTags('users')
@Controller('users')
// @UseFilters(UnauthorizedExceptionFilter)
export class UserController {
	constructor(private userService: UserService) { }

	/* Get my uuid */
	@UseGuards(JwtAuthGuard)
	@Get('/me')
	async getMyUser(@Req() req: Request) {
		return req.user;
	}

	/* Get user by id*/
	@ApiOkResponse({ description: 'user found' })
	@ApiUnauthorizedResponse({ description: 'user not authorized' })
	// @ApiParam({
	// 	name: 'id',
	// 	type: 'string',
	// })
	@UseGuards(JwtAuthGuard)
	@UsePipes(ValidationPipe)
	@Get(':id')
	async getUserbyId(@Param() id: uuidDto) {
		return await this.userService.getUserById(id.id);
	}

	/* Uploads an image locally and stores location in db*/
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				file: {
					type: 'string',
					format: 'binary',
				},
			},
		},
	})
	@ApiCreatedResponse({ description: 'Avatar  uploaded.' })
	@ApiUnauthorizedResponse({ description: 'user not authorized' })
	@UseGuards(JwtAuthGuard)
	@Post('/upload')
	@UseInterceptors(FileInterceptor('file', storage))
	uploadFile(@UploadedFile() file, @Req() req) {
		return this.userService.update(req.user.userId, {
			profileImage: './uploads/profileimages/' + file.filename,
		});
	}

	@ApiBody({ type: UpdateUsernameDto })
	@UseGuards(JwtAuthGuard)
	@Put('/updateUsername')
	async updateUsername(
		@Body() updateUsernameDto: UpdateUsernameDto,
		@Req() req: Request,
	) {
		return this.userService.update(req.user['userId'], {
			username: updateUsernameDto.username,
		});
	}
}
