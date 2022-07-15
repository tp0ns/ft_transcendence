import { Controller, Get, UseFilters, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt/jwt.guard';
import { UnauthorizedExceptionFilter } from './unauthorized.filter';

@Controller()
@UseFilters(UnauthorizedExceptionFilter)
export class AppController {
  constructor(	private readonly appService: AppService,
	) {}

	@UseGuards(JwtAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
