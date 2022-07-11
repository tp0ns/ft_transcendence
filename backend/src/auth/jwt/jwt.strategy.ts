import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './jwt.constants';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
		private userService: UserService,
	) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
				return request?.cookies?.Authentication
			}]),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
		const user = this.userService.getUserById(payload.sub);
    return user;
  }
}
