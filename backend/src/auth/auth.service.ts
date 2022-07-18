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
	 * @todo Il faut ajouter twofaAuthenticated: boolean au payload pour la 2FA
	 */
	async login(user: User, res: Response) {
    const payload = { sub: user.userId };
    const access_token= this.jwtService.sign(payload);

		const new_cookie=`Authentication=${access_token}; HttpOnly; Path=/; Max-Age=${jwtConstants.expire}`;
		res.header('Set-Cookie', new_cookie);

		res.redirect('http://localhost/');
  }

	async logout() {
		return await `Authentication=; HttpOnly; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`; //Max-age=0;
	}
}
