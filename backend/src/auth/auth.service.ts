/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/user/models/user.entity';
import { jwtConstants } from './jwt/jwt.constants';
import { Response } from 'express';

@Injectable()
export class AuthService {
	constructor(private jwtService: JwtService) {}

	/**
	 * Dans cette fonction on décide de ce qui va etre store (le payload) dans le JWT(JsonWebToken).
	 * On genere le JWT grace a la fonction sign du jwtService :
	 * 	- le jwtService est fournit par le module @nestjs/jwt
	 * 	- le secret et le temps de peremption qui servent a generer/signer le token sont set dans auth.module.ts,
	 *	dans le JwtModule.register()
	 * On definit comment le JWT va etre store :
	 *	- on a choisit de le store sous forme de cookie pour garder la logique dans le back
	 * On utilise res pour generer le nouveau cookie et nous rediriger a la page d'acceuil (fin de l'Auth)
	 *
	 */
	async login(user: UserEntity, res: Response) {
		const payload = {
			sub: user.userId,
			twoFAAuthenticated: false,
		};
		if (!user.isTwoFAEnabled) payload.twoFAAuthenticated = true;
		const access_token = this.jwtService.sign(payload);

		const new_cookie = `Authentication=${access_token}; Path=/; Max-Age=${jwtConstants.expire}`;
		res.clearCookie('Authentication');
		res.header('Set-Cookie', new_cookie);

		// rediriger soit vers la page front de la 2fa soit vers l'acceuil
		if (user.isTwoFAEnabled) res.redirect('/2fa');
		else res.redirect('/');
	}
}
