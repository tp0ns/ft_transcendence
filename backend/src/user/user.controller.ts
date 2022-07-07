import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { uuidv4 } from 'uuid'

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

	@Get("/:id")
	async	getUserbyId(@Param('id') id: uuidv4) {
		return await this.userService.getUserById(id);
	}

	@Post("/new")
	@UsePipes(ValidationPipe)
	async createUser(@Body() newUser: CreateUserDto) {
		return await this.userService.createUser(newUser);
	}
}
