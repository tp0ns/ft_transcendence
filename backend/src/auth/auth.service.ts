import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/user/user.entity';
import { jwtConstants } from './jwt/jwt.constants';
import { Response } from 'express';

@Injectable()
export class AuthService {
	constructor(
		private jwtService: JwtService
	) {}

	async login(user: User, res: Response) {
    const payload = { sub: user.userId };
    const access_token= this.jwtService.sign(payload);
		const new_cookie=`Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${jwtConstants.expire}`;

		res.header('Set-Cookie', new_cookie);
		res.redirect('/');
  }

	async logout() {
		return await `Authentication=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`; //Max-age=0;
	}
}
