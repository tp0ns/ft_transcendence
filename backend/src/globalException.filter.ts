import {
	ArgumentsHost,
	BadRequestException,
	Catch,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { QueryFailedError } from 'typeorm';
@Catch(WsException, HttpException, QueryFailedError)
export class globalExceptionFilter extends BaseWsExceptionFilter {
	public catch(
		exception: HttpException | WsException | QueryFailedError,
		host: ArgumentsHost,
	) {
		const client = host.switchToWs().getClient() as Socket;
		let error: string | object;
		if (exception instanceof BadRequestException) {
			error = exception.getResponse();
			if (typeof error == 'object')
				error = JSON.parse(JSON.stringify(error)).message[0];
			client.emit(`errorEvent`, error);
		} else if (exception instanceof WsException) {
			client.emit(`errorEvent`, exception.message);
		} else if (exception instanceof HttpException) {
			client.emit(`errorEvent`, exception.message);
		} else if (exception instanceof QueryFailedError) {
			client.emit(`errorEvent`, exception.message);
		}
	}
}
