import { Controller, Get, Req, UseFilters, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { UnauthorizedExceptionFilter } from './unauthorized.filter';

@Controller()
@UseFilters(UnauthorizedExceptionFilter)
export class AppController {
	constructor(private readonly appService: AppService) {}

	@UseGuards(JwtAuthGuard)
	@Get()
	getHello(@Req() req: Request): string {
		console.log(req.user);
		return this.appService.getHello();
	}
}
