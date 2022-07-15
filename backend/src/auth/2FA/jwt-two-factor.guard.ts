import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * The behaviour of auth guard is already determined by passport
 */
@Injectable()
export default class JwtTwoFactorGuard extends AuthGuard('jwt-two-factor') {}
