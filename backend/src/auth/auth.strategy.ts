import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Strategy, Profile } from 'passport-42';
import { UserService } from 'src/user/user.service';

/**
 * Cette classe represente la configuration de la strategie spécifique à l'authentification 42
 * elle est simplifiée grace à passport-42 [PassportStrategy(Strategy, '42')]
 */
@Injectable()
export class SchoolStrategy extends PassportStrategy(Strategy, '42') {
	constructor(private userService: UserService) {
		/**
		 * On appelle la methode super() pour configurer les parametres de la stratégie.
		 * 	- @param clientID L'ID de l'application autorise par L'API 42, et genere sur l'intra.
		 * 	- @param clientSecret Le secret de l'application autorise par L'API 42, et genere sur l'intra.
		 * 	- @param callbackURL L'URL sur lequel l'API 42 doit nous rediriger après le premier call API,
		 * 		il doit etre renseigné sur l'intra pour que cela fonctionne.
		 * 	- @param profileFields cet objet renseigne les champs de l'api42 qui sont necessaire au bon
		 * 		fonctionnement de notre appli.
		 */
		super({
			clientID: process.env.FORTYTWO_APP_ID,
			clientSecret: process.env.FORTYTWO_APP_SECRET,
			callbackURL: process.env.REDIRECT_URL,
			profileFields: {
				id: 'id',
				username: 'login',
				image_url: 'image_url',
				status: 'connected'
			},
		});
	}

	/**
	 * Validate est appelé apres 1er call à l'API 42.
	 * Cette fonction doit etre presente dans toute Strategie pour "Valider" le retour de l'API/l'Authentification.
	 * Dans notre cas, aucune reelle verification n'est faite (@todo), on se contente d'appeler findOrCreate.
	 *
	 * "For each strategy, Passport will call the verify function (implemented with the validate()
	 * method in @nestjs/passport) using an appropriate strategy-specific set of parameters."
	 *
	 * 	La suite de l'auth se poursuit dans callback dans auth.controller.ts, merci passport !
	 *
	 * @param profile ce que le premier call à l'API 42 a return, voir @param profileFields
	 * @returns renvoie un User qui est ajouté à la requête http de callback par passport
	 *
	 * @Todo Verifier que personne n'ai le meme username.
	 */
	async validate(accessToken, refreshToken, profile: Profile): Promise<any> {
		const user = this.userService.findOrCreate(profile);
		return await user;
	}
}
