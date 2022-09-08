import { ArgumentsHost, BadRequestException, Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { QueryFailedError } from 'typeorm';

@Catch(WsException, HttpException, QueryFailedError)
export class globalExceptionFilter {
  public catch(exception: HttpException | WsException | QueryFailedError, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException | QueryFailedError) {
	let status = HttpStatus.INTERNAL_SERVER_ERROR;
	
	switch (exception.constructor) {
		case HttpException:
			status = (exception as HttpException).getStatus();
			break;
		case WsException:
			client.emit('errorEvent', exception.message);
		case QueryFailedError:  // this is a TypeOrm error
			client.emit(`errorEvent`, exception.message);
			// status = HttpStatus.UNPROCESSABLE_ENTITY
			// message = (exception as QueryFailedError).message;
			// code = (exception as any).code;
			break;
		case BadRequestException:
			client.emit(`errorEvent`, exception.message);
			break;
		// case EntityNotFoundError:  // this is another TypeOrm error
		//     status = HttpStatus.UNPROCESSABLE_ENTITY
		//     message = (exception as EntityNotFoundError).message;
		//     code = (exception as any).code;
		//     break;
		// case CannotCreateEntityIdMapError: // and another
		//     status = HttpStatus.UNPROCESSABLE_ENTITY
		//     message = (exception as CannotCreateEntityIdMapError).message;
		//     code = (exception as any).code;
		//     break;
		default:
			status = HttpStatus.INTERNAL_SERVER_ERROR
        }
  }
}