import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { UserService } from 'src/user/user.service';

@Injectable()
export class SchoolStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private userService: UserService) {
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: process.env.REDIRECT_URL,
			profileFields: {
				id: 'id',
				username: 'login',
				image_url: 'image_url',
			},
		});
	}

	/**
	 * Validate est appelé entre le 1er("/login") et 2eme call("/callback") à l'API 42.
	 * C'est à ce moment la qu'on enregistre les infos du Profile qui vient de se connecter
	 * dans la table User.
	 *
	 * For each strategy, Passport will call the verify function (implemented with the validate()
	 * method in @nestjs/passport) using an appropriate strategy-specific set of parameters.
	 *
	 * @param profile ce que le premier call à l'API 42 a return, voir profileFields
	 * @returns renvoie un User qui est ajouté à la requête http de callback par passport
	 */
	async validate(accessToken, refreshToken, profile: Profile): Promise<any> {
		const user = this.userService.findOrCreate(profile);
		return await user;
	}
}
