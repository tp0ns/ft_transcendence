import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';

@Controller()
// @UseFilters(UnauthorizedExceptionFilter)
export class AppController {
	constructor(private readonly appService: AppService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	getHello(): string {
		return this.appService.getHello();
	}
}
