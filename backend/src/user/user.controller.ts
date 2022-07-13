import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
	Request,
	ConsoleLogger,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { uuidDto } from './dtos/uuidDto';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from './storage/storage';
import { Observable, of } from 'rxjs';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { User } from './user.entity';

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get(':id')
	async getUserbyId(@Param() id: uuidDto) {
		return await this.userService.getUserById(id.id);
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
