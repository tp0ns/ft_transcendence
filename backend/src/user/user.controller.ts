// eslint-disable-next-line prettier/prettier
import { Body, Controller, Get, Param, Post, UseFilters, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { uuidv4 } from 'uuid';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { UnauthorizedExceptionFilter } from 'src/unauthorized.filter';

@Controller('users')
@UseFilters(UnauthorizedExceptionFilter)
export class UserController {
	constructor(private userService: UserService) {}

	@UseGuards(JwtAuthGuard)
	@Get('/:id')
	async getUserbyId(@Param('id') id: uuidv4) {
		return await this.userService.getUserById(id);
	}

	// @Post("/new")
	// @UsePipes(ValidationPipe)
	// async createUser(@Body() newUser: CreateUserDto) {
	// 	return await this.userService.createUser(newUser);
	// }
}
