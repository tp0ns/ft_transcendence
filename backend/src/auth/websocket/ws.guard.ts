import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from '../jwt/jwt.constants';

@Injectable()
export class WsGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly userService: UserService,
	) {}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		try {
			let client: Socket = context.switchToWs().getClient();
			let sessionCookie: string | string[] = client.handshake.headers.cookie
				.split(';')
				.find(
					(cookie: string) =>
						cookie.startsWith(' Authentication') ||
						cookie.startsWith('Authentication'),
				)
				.split('=')[1];

			const payload = await this.jwtService.verify(sessionCookie, {
				secret: jwtConstants.secret,
			});
			const user = await this.userService.getUserById(payload.sub);

			client.data.user = user;
			if (user) return await true;
			return await false;
		} catch (err) {
			console.log('Error occured in ws guard : ');
			console.log(err.message);
			throw new WsException(err.message);
		}
	}
}
