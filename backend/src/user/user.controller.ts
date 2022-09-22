import {
	Body, Controller,
	Get, HttpException,
	HttpStatus, Param,
	Post, Put,
	Req, UploadedFile,
	UseGuards,
	UseInterceptors, UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiTags,
	ApiUnauthorizedResponse
} from '@nestjs/swagger';
import { Request } from 'express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { v4 as uuidv4 } from 'uuid';
import { UpdateUsernameDto } from './dtos/UpdateUsernameDto';
import { uuidDto } from './dtos/uuidDto';
import { UserService } from './user.service';
import path = require('path');

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

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
	@UseInterceptors(
		FileInterceptor('file', {
			limits: {
				fileSize: 8000000, // 1MB in Bytes
			},
			storage: diskStorage({
				destination: './uploads/profileimages',
				filename: (req, file, cb) => {
					const filename: string =
						path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
					const extension: string = path.parse(file.originalname).ext;

					cb(null, `${filename}${extension}`);
				},
			}),
			fileFilter: (req, file, cb) => {
				if (file.mimetype.split('/')[0] !== 'image')
					return cb(
						new HttpException(
							'Only upload image',
							HttpStatus.UNSUPPORTED_MEDIA_TYPE,
						),
						false,
					);
				return cb(null, true);
			},
		}),
	)
	uploadFile(@UploadedFile() file, @Req() req) {
		return this.userService.update(req.user.userId, {
			profileImage: './uploads/profileimages/' + file.filename,
		});
	}

	@ApiBody({ type: UpdateUsernameDto })
	@UseGuards(JwtAuthGuard)
	@UsePipes(ValidationPipe)
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
