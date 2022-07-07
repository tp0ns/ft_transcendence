import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { schoolAuthGuard } from './guards/auth.guard';

@Controller('auth/42')
export class AuthController {

	/**
	 * Premier call à L'API, UseGuard appelle passport
	 */
	@Get('login')
	@UseGuards(schoolAuthGuard)
	async	login() {
		return ;
	}

	/**
	 * Callback effectué directement par l'API
	 * Puisque passport est passé par la fonction validate, la requete
	 * est aggremente d'un objet User qui correspond au user qui vient
	 * de se connecter.
	 */
	@Get('callback')
	@UseGuards(schoolAuthGuard)
	async callback() {
		//handle jwt
		return ;
	}
}
