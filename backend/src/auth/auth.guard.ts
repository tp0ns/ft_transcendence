import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * C'est grace au module passport-42 que l'on a pas besoin de specifier le comportement du AuthGuard.
 * Passport-42 le fait pour nous, on renseigne simplement qu'on utilise le module / la stratégie '42'.
 */
@Injectable()
export class schoolAuthGuard extends AuthGuard('42') {}
