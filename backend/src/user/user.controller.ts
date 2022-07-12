import {
	Body,
	Controller,
	Get,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { uuidDto } from './dtos/uuidDto';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from './storage/storage';
import { Observable, of } from 'rxjs';

@ApiTags('users')
@Controller('users')
export class UserController {
	constructor(private userService: UserService) {}

	@Get(':id')
	async getUserbyId(@Param() id: uuidDto) {
		return await this.userService.getUserById(id.id);
	}

	@Post('/upload')
	@UseInterceptors(FileInterceptor('file', storage))
	uploadFile(@UploadedFile() file): Observable<Object> {
		console.log(file);
		return of({ imagePath: file.filename });
	}
	// @Post("/new")
	// @UsePipes(ValidationPipe)
	// async createUser(@Body() newUser: CreateUserDto) {
	// 	return await this.userService.createUser(newUser);
	// }
}
