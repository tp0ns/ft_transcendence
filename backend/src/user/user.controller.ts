import {
	Controller,
	Get,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Request,
	UseFilters,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from './storage/storage';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { uuidv4 } from 'uuid';
import { UnauthorizedExceptionFilter } from 'src/unauthorized.filter';

@ApiTags('users')
@Controller('users')
@UseFilters(UnauthorizedExceptionFilter)
export class UserController {
	constructor(private userService: UserService) {}

	@UseGuards(JwtAuthGuard)
	@Get('/:id')
	async getUserbyId(@Param('id') id: uuidv4) {
		return await this.userService.getUserById(id);
	}

	/* Uploads an image locally and stores location in db*/
	@UseGuards(JwtAuthGuard)
	@Post('/upload')
	@UseInterceptors(FileInterceptor('file', storage))
	uploadFile(@UploadedFile() file, @Request() req) {
		return this.userService.update(req.userId, {
			profileImage: './uploads/profileimages/' + file.filename,
		});
	}
	// @Post("/new")
	// @UsePipes(ValidationPipe)
	// async createUser(@Body() newUser: CreateUserDto) {
	// 	return await this.userService.createUser(newUser);
	// }
}
