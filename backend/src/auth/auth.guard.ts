import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';

/**
 * C'est grace au module passport-42 que l'on a pas besoin de specifier le comportement du AuthGuard.
 * Passport-42 le fait pour nous, on renseigne simplement qu'on utilise le module / la stratégie '42'.
 */
@Injectable()
export class schoolAuthGuard extends AuthGuard('42') {
	handleRequest<TUser = any>(
		err: any,
		user: any,
		info: any,
		context: any,
		status?: any,
	): TUser | null {
		if (err || !user) {
			return null;
		}
		return user;
	}
}
