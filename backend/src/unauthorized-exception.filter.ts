import { ExceptionFilter, Catch, ArgumentsHost, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';


/**
 * This function catches all Unauthorized Exception (401) to redirect the user to
 * @param redirect_path.
 * We want this to happen everytime so we add it globally in main.ts with this line :
 *		- app.useGlobalFilters(new UnauthorizedExceptionFilter());
 */
@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

		const redirect_path = '/auth/42/login'

		response.redirect(redirect_path)
	}
}
