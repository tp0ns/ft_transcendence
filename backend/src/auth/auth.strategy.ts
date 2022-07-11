import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-oauth2';

@Injectable()
export class schoolStrategy extends PassportStrategy(Strategy, '42') {
	constructor() {
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: 'qwe',
			// authorizationURL: null,
			// tokenURL        : null,
			// scope           : null,
		});
	}

	async validate(accessToken: string): Promise<any> {}
}
