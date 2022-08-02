import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Req } from '@nestjs/common';
import { jwtConstants } from './jwt.constants';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { UserEntity } from 'src/user/models/user.entity';

/**
 * Cette classe represente la configuration de la strategie spécifique à la lecture de token JWT
 * elle est simplifiée grace à passport-jwt.
 * [PassportStrategy(Strategy)], Strategy étant importe de passport-jwt.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private userService: UserService) {
		/**
		 * On appelle la methode super() pour configurer les parametres de la stratégie.
		 * 	@param jwtFromRequest Comment retrouver le JWT
		 * 	@param ignoreExpiration Permet de tenir compte (ou pas) de la date d'expiration du cookie
		 * 	@param secretOrKey Renseigne le secret qui permet de valider ou non le JWT
		 */
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.cookies?.Authentication;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: jwtConstants.secret,
			passReqToCallback: true,
		});
	}

	/**
	 * Si on arrive ici c'est que le JWT est valide, on va maintenant verifier que le userId contenu dans le payload
	 * appartient bien a un de nos utilisateur et retourner celui-ci !
	 *
	 * @param payload
	 * @returns a UserEntity.
	 *
	 * @todo C'est ici qu'on va integrer le 2FA, notament grace au payload avec un booleen twofaAuthenticated.
	 * @coucou Elias <3
	 */
	async validate(req: Request, payload: any) {
		const user = await this.userService.getUserById(payload.sub);
		if (!user.isTwoFAEnabled) return user;
		else if (payload.twoFAAuthenticated || req.url == '/backend/auth/2fa/authenticate')
			return user;
		return;
	}
}
