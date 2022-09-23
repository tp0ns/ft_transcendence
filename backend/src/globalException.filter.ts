import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	ForbiddenException,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { QueryFailedError } from 'typeorm';
@Catch(WsException, QueryFailedError, ForbiddenException)
export class globalExceptionFilter extends BaseWsExceptionFilter {
	public catch(
		exception: WsException | QueryFailedError,
		host: ArgumentsHost,
	) {
		const client = host.switchToWs().getClient() as Socket;
		let error: string | object;
		if (exception instanceof BadRequestException) {
			error = exception.getResponse();
			if (typeof error == 'object')
				error = JSON.parse(JSON.stringify(error)).message[0];
		}
		else if (exception instanceof ForbiddenException) {
			error = exception.message;
		}else if (exception instanceof WsException) {
			error = exception.message;
		} 
		// else if (exception instanceof HttpException) {
		// 	error = exception.getResponse();
		// } 
		else if (exception instanceof QueryFailedError) {
			error = exception.message;
		}
		client.emit(`errorEvent`, error);
	}
}
