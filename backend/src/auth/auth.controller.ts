import {
	Catch,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { schoolAuthGuard } from './auth.guard';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth/42')
export class AuthController {
	constructor(private authService: AuthService) {}

	/**
	 * Comme pour tout module c'est au controller que tout commence.
	 * On peut voir que cette root est protégée par un "guard".
	 * Ce guard @param schoolAuthGuard va, grâce à passport,
	 * verifier que la strategy @param SchoolStrategy à laquelle
	 * ils sont assigné est bien respectée. Si ce n'est pas le cas
	 * ils vont exécuter cette stratégie. Cette logique est la même pour
	 * tout les @param AuthGuard.
	 */
	@UseGuards(schoolAuthGuard)
	@Get('login')
	async login() {
		return;
	}

	/**
	 * Cette route est celle renseignée par @param callbackURL dans @param SchoolStrategy.
	 * Puisque passport est passé par la fonction validate, la requete @Req
	 * est aggrémentée d'un objet User "req.user" qui correspond au user qui vient
	 * de se connecter.
	 *
	 * On envoie cet objet et l'objet @res à login pour pouvoir génerer un JWT, afin d'avoir une vraie connexion
	 * identifiée à un User (le fameux login).
	 */
	@UseGuards(schoolAuthGuard)
	@Get('callback')
	async callback(@Req() req, @Res() res) {
		return this.authService.login(req.user, res);
	}

	/**
	 * Supprime le contenu du cookie pour qu'il ne contienne plus de JWT.
	 * L'urilisateur n'est donc plus identifié.
	 * @todo La logique, Unauthorized => Page de connexion, voir "authentication extending guards"
	 */
	@UseGuards(JwtAuthGuard)
	@Get('logout')
	async logout(@Req() request: Request, @Res() res: Response) {
		const new_cookie = await this.authService.logout();
		res.setHeader('Set-Cookie', new_cookie);
		return res.sendStatus(200);
	}
}
