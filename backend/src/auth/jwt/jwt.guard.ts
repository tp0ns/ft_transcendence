import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * C'est grace au module passport-jwt que l'on a pas besoin de specifier le comportement du AuthGuard.
 * passport-jwt le fait pour nous, on renseigne simplement qu'on utilise le module / la stratégie 'jwt'.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
