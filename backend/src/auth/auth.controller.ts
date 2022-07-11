import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { schoolAuthGuard } from './auth.guard';
import { JwtAuthGuard } from './jwt/jwt.guard';

@Controller('auth/42')
export class AuthController {
	constructor(
		private authService: AuthService
	) {}
	/**
	 * Premier call à L'API, UseGuard appelle passport
	 */
	@UseGuards(schoolAuthGuard)
	@Get('login')
	async	login() {
		return ;
	}

	/**
	 * Callback effectué directement par l'API
	 * Puisque passport est passé par la fonction validate, la requete
	 * est aggremente d'un objet User qui correspond au user qui vient
	 * de se connecter.
	 * On renvoit l'objet user a la fonction login pour qu'elle genere un JWT
	 */
	@UseGuards(schoolAuthGuard)
	@Get('callback')
	async callback(@Req() req, @Res() res) {
		return this.authService.login(req.user, res);
	}

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  async logout(@Req() request: Request, @Res() res: Response) {
    const new_cookie = await this.authService.logout();
		res.setHeader('Set-Cookie', new_cookie );
    return res.sendStatus(200);
  }
}
