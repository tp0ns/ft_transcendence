// eslint-disable-next-line prettier/prettier
import {
	Catch,
	Controller,
	Get,
	Param,
	Post,
	Req,
	Res,
	UseFilters,
	UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { schoolAuthGuard } from './auth.guard';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { UserService } from 'src/user/user.service';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { UnauthorizedExceptionFilter } from 'src/unauthorized.filter';
import { ApiTags } from '@nestjs/swagger';
import { UserEntity } from 'src/user/models/user.entity';

@ApiTags('auth')
@Controller('auth')
// @UseFilters(UnauthorizedExceptionFilter)
export class AuthController {
	constructor(
		private userService: UserService,
		private authService: AuthService,
		private httpService: HttpService,
	) {}

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
	 * est aggrémentée d'un objet UserEntity "req.user" qui correspond au user qui vient
	 * de se connecter.
	 *
	 * On envoie cet objet et l'objet @res à login pour pouvoir génerer un JWT, afin d'avoir une vraie connexion
	 * identifiée à un UserEntity (le fameux login).
	 */
	@UseGuards(schoolAuthGuard)
	@Get('callback')
	async callback(@Req() req, @Res() res) {
		if (req.user) return this.authService.login(req.user, res);
		res.redirect('/login');
	}

	/**
	 * Generateur de faux compte ("dummy") pour tester plus facilement
	 * à enlever en production / correction !
	 */
	@Get('dummy')
	async dummy(@Res() res) {
		const { data } = await firstValueFrom(
			this.httpService.get('https://api.namefake.com/'),
		);
		const fake = JSON.parse(JSON.stringify(data));

		const dummy = {
			id: Math.floor(100000 + Math.random() * 900000),
			username: fake.name.split(' ')[1],
			image_url:
				'https://www.myinstants.com/media/instants_images/non.gif.pagespeed.ce.C9gtkT1Vx9.gif',
		};

		const dummy_user: UserEntity = await this.userService.findOrCreate(dummy);
		return await this.authService.login(dummy_user, res);
	}

	/**
	 * Connexion rapides a un compte existant pour tester plus facilement
	 * à enlever en production / correction !
	 *
	 * Si je met id: uuidDto ca arrete de marcher completement et le id devient le premier de la table (wtf ?).
	 * Swagger reconnait pas uuidv4 comme type donc il affiche pas de param quand il est de ce type.
	 * Je le met en string ducoup meme si c'est pas beau et pas secur, vu qu'on va enlever
	 * a la correction de toute facon
	 */

	// @UseGuards(JwtAuthGuard)
	@Get('login/:id')
	async dummyLogin(@Param('id') id: string, @Res() res) {
		const dummy_user = await this.userService.getUserById(id);
		return await this.authService.login(dummy_user, res);
	}

	/**
	 * Supprime le contenu du cookie pour qu'il ne contienne plus de JWT.
	 * L'utilisateur n'est donc plus identifié.
	 * La logique, Unauthorized => Page de connexion, voir "authentication extending guards"
	 */
	@UseGuards(JwtAuthGuard)
	@Get('logout')
	async logout(@Req() request: Request, @Res() res: Response) {
		// const new_cookie = await this.authService.logout();
		// res.setHeader('Set-Cookie', new_cookie);
		this.userService.disconnectClient(request.user);
		res.clearCookie('Authentication');
		return res.sendStatus(200);
	}
}
